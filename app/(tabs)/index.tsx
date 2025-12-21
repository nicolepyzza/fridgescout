import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
// Lazy-load `expo-camera` at runtime to avoid crashing Expo Go when native
// camera/barcode modules aren't present in the binary. See `loadCamera()` below.
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const STORAGE_KEY = "fridgescout_items_v1";

const uid = () => Math.random().toString(36).slice(2, 10);

async function ensureNotificationPermissions() {
  if (!Device.isDevice) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Notifications disabled", "Expiry reminders won’t appear.");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("expiry", {
      name: "Expiration reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export default function HomeScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [cameraModule, setCameraModule] = useState<any | null>(null);
  const [camPermission, setCamPermission] = useState<any>(null);
  // Backwards-compat alias for any remaining references to `permission`
  const permission = camPermission;
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedOnce, setScannedOnce] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);

  const [draft, setDraft] = useState({
    barcode: "",
    title: "",
    expiresOn: "",
    remindDaysBefore: "2",
  });

  useEffect(() => {
    ensureNotificationPermissions();
    AsyncStorage.getItem(STORAGE_KEY).then((d) =>
      d ? setItems(JSON.parse(d)) : null
    );
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const onScan = async ({ data }: any) => {
    if (scannedOnce) return;
    setScannedOnce(true);
    setScannerOpen(false);
    
    // Try to fetch product info from Open Food Facts
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${data}`);
      const json = await response.json();
      
      if (json.status === 1 && json.product) {
        const product = json.product;
        const productName = product.product_name || `Item ${data.slice(-5)}`;
        setDraft((p) => ({ ...p, barcode: data, title: productName }));
        // Silently added, no alert
      } else {
        // Product not found in database
        Alert.alert(
          "Product Not Found",
          `Barcode ${data} is not in our database. You can manually enter the product name.`,
          [{ text: "OK" }]
        );
        setDraft((p) => ({ ...p, barcode: data, title: "" }));
      }
    } catch (error) {
      console.warn('Failed to fetch product info:', error);
      Alert.alert(
        "Lookup Failed",
        "Could not connect to product database. Please enter the product name manually.",
        [{ text: "OK" }]
      );
      setDraft((p) => ({ ...p, barcode: data, title: "" }));
    }
  };

  const addItem = () => {
    if (!draft.title) {
      Alert.alert("Missing info", "Please add an item name.");
      return;
    }

    (async () => {
      let notificationId: string | undefined;
      if (draft.expiresOn) {
        try {
          const expires = new Date(draft.expiresOn);
          if (!isNaN(expires.getTime())) {
            const daysBefore = parseInt(draft.remindDaysBefore || "0", 10) || 0;
            const triggerDate = new Date(expires);
            triggerDate.setDate(triggerDate.getDate() - daysBefore);

            // Only schedule if trigger is in the future
            if (triggerDate.getTime() > Date.now()) {
              notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                  title: "Fridge item expiring",
                  body: `${draft.title} is approaching its expiration date.`,
                  data: { barcode: draft.barcode },
                },
                trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
              });
            }
          }
        } catch (e) {
          console.warn("Failed to schedule notification", e);
        }
      }

      setItems((p) => [
        {
          id: uid(),
          ...draft,
          addedAt: new Date().toISOString(),
          notificationId,
        },
        ...p,
      ]);
    })();

    setDraft({ barcode: "", title: "", expiresOn: "", remindDaysBefore: "2" });
  };

  const removeItem = async (id: string) => {
    const toRemove = items.find((it) => it.id === id);
    if (toRemove?.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(toRemove.notificationId);
      } catch (e) {
        console.warn("Failed to cancel notification", e);
      }
    }
    setItems((p) => p.filter((it) => it.id !== id));
  };

  function formatDate(d: string) {
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString();
    } catch {
      return d;
    }
  }

  function daysUntil(d: string) {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "—";
    const diff = Math.ceil((dt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 1 ? `${diff} days` : diff === 1 ? `1 day` : diff === 0 ? `today` : `${Math.abs(diff)} days ago`;
  }

  function daysInFridge(addedAt: string) {
    const added = new Date(addedAt);
    if (isNaN(added.getTime())) return "—";
    const days = Math.floor((Date.now() - added.getTime()) / (1000 * 60 * 60 * 24));
    return days === 0 ? "Added today" : days === 1 ? "1 day" : `${days} days`;
  }

  function getExpiryStatus(expiresOn: string) {
    const dt = new Date(expiresOn);
    if (isNaN(dt.getTime())) return "Invalid date";
    const diff = Math.ceil((dt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `⚠️ EXPIRED ${Math.abs(diff)} days ago`;
    if (diff === 0) return "⚠️ EXPIRES TODAY";
    if (diff === 1) return "⚠️ Expires tomorrow";
    if (diff <= 3) return `⚠️ Expires in ${diff} days`;
    return `Expires: ${formatDate(expiresOn)} (${diff} days)`;
  }

  function getExpiryColor(expiresOn: string) {
    const dt = new Date(expiresOn);
    if (isNaN(dt.getTime())) return "#8f9aa6";
    const diff = Math.ceil((dt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "#ff4444"; // Expired - red
    if (diff <= 1) return "#ff8844"; // Expires today/tomorrow - orange
    if (diff <= 3) return "#ffbb44"; // Expires soon - yellow
    return "#88bb88"; // Good - green
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>FridgeScout</Text>
        {camPermission?.granted === false ? (
          <Text style={styles.permissionHint}>
            Camera permission is off. Tap Scan to grant access (or enable it in Settings).
          </Text>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.title}>Add Item</Text>
          <Text style={{color:'#B8D4CE',fontSize:12,marginBottom:8}}>Scan a barcode or manually enter item details</Text>

          <View style={styles.row}>
            <TextInput
              placeholder="Barcode (optional)"
              value={draft.barcode}
              onChangeText={(t) => setDraft({ ...draft, barcode: t })}
              style={styles.input}
              placeholderTextColor="#7DD3C0"
            />
            <Pressable
              style={styles.btn}
              onPress={async () => {
                // Lazy-load camera module and request permission when user opens scanner
                if (!cameraModule) {
                  try {
                    const mod = await import("expo-camera");
                    setCameraModule(mod);
                    if (mod.Camera?.requestCameraPermissionsAsync) {
                      const res = await mod.Camera.requestCameraPermissionsAsync();
                      setCamPermission(res);
                    }
                  } catch (e) {
                    console.warn("Failed to load expo-camera", e);
                  }
                }

                if (camPermission && camPermission.granted === false) {
                  Alert.alert(
                    "Camera blocked",
                    "Enable camera access in Settings to scan barcodes."
                  );
                  return;
                }

                setScannedOnce(false);
                setScannerOpen(true);
              }}
            >
              <Text style={styles.btnText}>Scan</Text>
            </Pressable>
          </View>

          <TextInput
            placeholder="Item name"
            value={draft.title}
            onChangeText={(t) => setDraft({ ...draft, title: t })}
            style={styles.input}
            placeholderTextColor="#7DD3C0"
          />

          <Text style={{color:'#B8D4CE',fontSize:12,marginBottom:4}}>Expiration date (YYYY-MM-DD)</Text>
          <Pressable onPress={() => setShowDatePicker(true)}>
            <TextInput
              placeholder="2025-12-31"
              value={draft.expiresOn}
              onChangeText={(t) => setDraft({ ...draft, expiresOn: t })}
              style={styles.input}
              placeholderTextColor="#7DD3C0"
              editable={false}
              pointerEvents="none"
            />
          </Pressable>
          {showDatePicker && (
            <View style={{marginVertical: 8, width: '99%', alignItems: 'center'}}>
              <DateTimePicker
                value={draft.expiresOn ? new Date(draft.expiresOn) : new Date()}
                mode="date"
                display="inline"
                themeVariant="dark"
                accentColor="#7DD3C0"
                textColor="#FFFFFF"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const formatted = selectedDate.toISOString().split('T')[0];
                    setDraft({ ...draft, expiresOn: formatted });
                  }
                }}
              />
            </View>
          )}

          <Text style={{color:'#B8D4CE',fontSize:12,marginBottom:4}}>Remind me (days before expiry)</Text>
          <TextInput
            placeholder="2"
            value={draft.remindDaysBefore}
            onChangeText={(t) => setDraft({ ...draft, remindDaysBefore: t })}
            keyboardType="number-pad"
            style={styles.input}
          />

          <Pressable style={styles.btnPrimary} onPress={addItem}>
            <Text style={styles.btnText}>Add to Fridge</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Your Fridge</Text>
          {items.map((item) => (
            <View key={item.id} style={{marginBottom:12,paddingBottom:12,borderBottomWidth:1,borderBottomColor:'#3A5C65'}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <View style={{flex:1}}>
                  <Text style={styles.item}>• {item.title}</Text>
                  <Text style={{color:'#7A9EA0',fontSize:11}}>
                    In fridge: {daysInFridge(item.addedAt)}
                    {item.expiresOn && (() => {
                      const dt = new Date(item.expiresOn);
                      const diff = Math.ceil((dt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      // Only show expiration date if not urgent (more than 3 days away)
                      return diff > 3 ? ` • Exp: ${formatDate(item.expiresOn)}` : '';
                    })()}
                  </Text>
                </View>
                <Pressable
                  onPress={() => removeItem(item.id)}
                  style={{padding:6,backgroundColor:'#1E3540',borderRadius:8}}
                >
                  <Text style={{color:'#fff',fontWeight:'700',fontSize:12}}>Remove</Text>
                </Pressable>
              </View>
              {item.expiresOn ? (
                <Text style={{color:getExpiryColor(item.expiresOn),fontSize:12,marginTop:4,fontWeight:'600'}}>
                  {getExpiryStatus(item.expiresOn)}
                </Text>
              ) : null}
              {item.notificationId ? (
                <Text style={{color:'#7DD3C0',fontSize:11,marginTop:2}}>🔔 Reminder set</Text>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={scannerOpen}
        animationType="slide"
        onRequestClose={() => setScannerOpen(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Scan a barcode</Text>
            <Pressable
              style={styles.scannerClose}
              onPress={() => setScannerOpen(false)}
            >
              <Text style={styles.scannerCloseText}>Close</Text>
            </Pressable>
          </View>

          {/* Simulator helper: allow faking a barcode when no real camera is available */}
          {!Device.isDevice && (
            <View style={{paddingHorizontal:14, paddingBottom:8}}>
              <Pressable
                onPress={() => {
                  const fake = `SIM-${Date.now().toString().slice(-6)}`;
                  onScan({ data: fake });
                }}
                style={{backgroundColor:'#3A5C65',padding:10,borderRadius:10,alignItems:'center'}}
              >
                <Text style={{color:'#fff',fontWeight:'700'}}>Simulate scan</Text>
              </Pressable>
            </View>
          )}

          {cameraModule ? (
            (() => {
              const CameraComp = cameraModule.CameraView ?? cameraModule.Camera;
              if (!CameraComp) return (
                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                  <Text style={{color:'#fff'}}>Camera component unavailable</Text>
                </View>
              );

              // CameraView in dev client uses barCodeScannerSettings and onBarcodeScanned
              return (
                <View style={{flex: 1}}>
                  <CameraComp
                    style={{flex: 1}}
                    facing="back"
                    barcodeScannerSettings={{
                      barcodeTypes: [
                        "qr", "pdf417", "aztec", "ean13", "ean8", "upc_e", "datamatrix",
                        "code39", "code93", "itf14", "codabar", "code128", "upc_a"
                      ],
                    }}
                    onBarcodeScanned={!scannedOnce ? ({ data }: any) => {
                      setLastScannedBarcode(data);
                      // Auto-capture immediately
                      onScan({ data });
                    } : undefined}
                  />
                  {/* Scanning guide overlay */}
                  <View style={styles.scannerOverlay}>
                    <View style={styles.scanBox}>
                      <View style={[styles.corner, styles.cornerTopLeft]} />
                      <View style={[styles.corner, styles.cornerTopRight]} />
                      <View style={[styles.corner, styles.cornerBottomLeft]} />
                      <View style={[styles.corner, styles.cornerBottomRight]} />
                    </View>
                    <Text style={styles.scanInstruction}>Position barcode within frame</Text>
                    
                    {/* Manual capture button */}
                    <Pressable
                      style={styles.captureButton}
                      onPress={() => {
                        if (lastScannedBarcode) {
                          onScan({ data: lastScannedBarcode });
                        } else {
                          Alert.alert("No Barcode Detected", "Please position a barcode in the frame first.");
                        }
                      }}
                    >
                      <View style={styles.captureButtonInner} />
                    </Pressable>
                  </View>
                </View>
              );
            })()
          ) : (
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
              <Text style={{color:'#fff'}}>Camera unavailable in this build</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#2C4A52" },
  container: { padding: 20 },
  h1: { fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 10 },
  permissionHint: { color: "#B8D4CE", marginBottom: 10 },
  card: {
    backgroundColor: "#3A5C65",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  title: { color: "#fff", fontWeight: "700", marginBottom: 8 },
  input: {
    backgroundColor: "#2C4A52",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    flex: 1,
  },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  btn: {
    backgroundColor: "#7DD3C0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  btnPrimary: {
    backgroundColor: "#7DD3C0",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#1E3540", fontWeight: "700" },
  item: { color: "#B8D4CE", marginTop: 4 },
  scannerHeader: {
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scannerTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  scannerClose: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#3A5C65",
    borderRadius: 10,
  },
  scannerCloseText: { color: "#fff", fontWeight: "700" },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: 250,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#7DD3C0',
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanInstruction: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 30,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7DD3C0',
  },
});