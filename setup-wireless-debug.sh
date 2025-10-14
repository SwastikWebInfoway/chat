#!/bin/bash

# Wireless React Native Debug Setup Script
# This script sets up wireless debugging for React Native Android apps

echo "🚀 Setting up Wireless React Native Debugging..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get host IP
HOST_IP=$(hostname -I | awk '{print $1}')
if [ -z "$HOST_IP" ]; then
    HOST_IP="localhost"
fi

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we have a saved IP address
if [ -f ".wireless_debug_ip" ]; then
    SAVED_IP=$(cat .wireless_debug_ip)
    print_status "Found saved IP address: $SAVED_IP"

    # Try to connect directly to saved IP
    print_status "Attempting to connect to saved IP..."
    adb connect $SAVED_IP:5555 2>/dev/null

    if [ $? -eq 0 ]; then
        print_success "Connected using saved IP address!"
        print_status "Starting Metro bundler for wireless debugging..."
        npx react-native start --host 0.0.0.0 > /dev/null 2>&1 &
        print_success "Metro started in background"
        echo ""
        print_success "🎉 Wireless debugging ready!"
        print_status "In your app, shake device > Dev Menu > Settings > Debug server host & port for device"
        print_status "Set to: $HOST_IP:8081"
        print_status "You can now run: npx react-native run-android --no-packager"
        exit 0
    else
        print_warning "Saved IP connection failed, setting up from scratch..."
    fi
fi

# Check if device is connected via USB
print_status "Checking for connected Android devices..."
DEVICES=$(adb devices | grep -v "List" | grep "device" | wc -l)

if [ $DEVICES -eq 0 ]; then
    print_error "No Android device found! Please connect your device via USB first."
    print_status "Make sure USB debugging is enabled in Developer Options."
    exit 1
fi

print_success "Found $DEVICES device(s) connected"

# Get device ID (prefer USB connection for setup)
DEVICE_ID=$(adb devices | grep -v "List" | grep "device" | grep -v ":5555" | head -1 | awk '{print $1}')

if [ -z "$DEVICE_ID" ]; then
    # If no USB device, check if wireless is already connected
    WIRELESS_DEVICE=$(adb devices | grep ":5555" | head -1 | awk '{print $1}')
    if [ -n "$WIRELESS_DEVICE" ]; then
        print_success "Device already connected wirelessly: $WIRELESS_DEVICE"
        print_success "🎉 Wireless debugging is already active!"
        exit 0
    else
        print_error "No suitable device connection found"
        exit 1
    fi
fi

print_status "Using device: $DEVICE_ID"

# Enable TCP/IP mode
print_status "Enabling TCP/IP mode on port 5555..."
adb -s $DEVICE_ID tcpip 5555

if [ $? -eq 0 ]; then
    print_success "TCP/IP mode enabled successfully"
else
    print_error "Failed to enable TCP/IP mode"
    exit 1
fi

# Wait a moment for the device to restart in TCP mode
sleep 3

# Get device IP address
print_status "Getting device IP address..."
DEVICE_IP=$(adb -s $DEVICE_ID shell ip route | awk '{print $9}')

if [ -z "$DEVICE_IP" ]; then
    print_error "Could not retrieve device IP address"
    exit 1
fi

print_success "Device IP: $DEVICE_IP"

# Now connect wirelessly
print_status "Connecting wirelessly to $DEVICE_IP:5555..."
adb connect $DEVICE_IP:5555

if [ $? -eq 0 ]; then
    print_success "Successfully connected wirelessly!"
else
    print_error "Failed to connect wirelessly"
    exit 1
fi

# Verify wireless connection
sleep 2
WIRELESS_DEVICES=$(adb devices | grep "$DEVICE_IP:5555" | wc -l)

if [ $WIRELESS_DEVICES -gt 0 ]; then
    print_success "Wireless connection verified!"
    print_status "You can now disconnect the USB cable."
else
    print_warning "Wireless connection may not be established properly."
    print_status "Try running: adb connect $DEVICE_IP:5555 manually"
fi

# Save the IP address to a config file for future use
echo "$DEVICE_IP" > .wireless_debug_ip
print_success "IP address saved for future use"
print_status "Starting Metro bundler for wireless debugging..."
npx react-native start --host 0.0.0.0 > /dev/null 2>&1 &
print_success "Metro started in background"

echo ""
print_success "🎉 Wireless debugging setup complete!"
print_status "Next time, just run this script again - no USB needed!"
echo ""
print_status "To start development:"
echo "  1. Metro is running wirelessly"
echo "  2. In your app, shake device > Dev Menu > Settings > Debug server host & port for device"
echo "     Set to: $HOST_IP:8081"
echo "  3. Run: npx react-native run-android --no-packager"
echo "     (Use --no-packager if Metro is already running)"
echo "  4. Or reload existing app by shaking device"
echo ""
print_warning "⚠️  IMPORTANT: If switching from USB to wireless,"
print_warning "   you may need to rebuild the app once:"
print_warning "   npx react-native run-android --no-packager"