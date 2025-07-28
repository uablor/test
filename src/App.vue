<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'

// พิกัดของบริษัท
const companyLatitude = 18.032616885792567
const companyLongitude = 102.64114300398856
const companyRadius = 30 // เมตร - ปรับได้

// พิกัดที่ดึงจาก Geolocation API
const latitude = ref<number | null>(null)
const longitude = ref<number | null>(null)
const isInsideCompany = ref(false)
const distanceFromCompany = ref<number | null>(null)
const clockOutTime = ref<string | null>(null)
const isWorkingOffsite = ref(false)
const lastCheckTime = ref<Date | null>(null)
const locationAccuracy = ref<number | null>(null)
const trackingEnabled = ref(true)
const checkInterval = ref(4000) // Default 30 seconds

// สถานะการเชื่อมต่อ
const isOnline = ref(navigator.onLine)
const locationError = ref<string | null>(null)

// ประวัติตำแหน่ง (เก็บ 10 รายการล่าสุด)
const locationHistory = ref<Array<{
  timestamp: Date,
  lat: number,
  lng: number,
  distance: number,
  accuracy: number
}>>([])

// Computed properties
const statusText = computed(() => {
  if (isWorkingOffsite.value) return '📅 ເຮັດວຽກນອກສະຸຖານທີ່'
  if (isInsideCompany.value) return '✅ ຢຸ່ໃນຄິນີກ'
  return '❌ ຢຸ່ນອກຄິນີກ ບໍ່ສາມາເຂົ້າງານໄດ້'
})

const batteryOptimizedInterval = computed(() => {
  // ปรับความถี่ตามสถานะ
  if (isInsideCompany.value) return 60000 // 1 นาที เมื่ออยู่ในบริษัท
  if (isWorkingOffsite.value) return 300000 // 5 นาที เมื่อทำงานนอกสถานที่
  return checkInterval.value // ใช้ค่าที่ตั้งไว้เมื่ออยู่นอกบริษัท
})

// ฟังก์ชัน Haversine สำหรับคำนวณระยะห่าง
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radius ในหน่วยเมตร
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // ระยะห่างในหน่วยเมตร
}

// ฟังก์ชันแจ้งเตือน
const showNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' })
  }
}

// ขอสิทธิ์การแจ้งเตือน
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

// ฟังก์ชันตรวจสอบตำแหน่งและคำนวณระยะห่าง
const checkLocation = async () => {
  if (!trackingEnabled.value || !navigator.geolocation) {
    locationError.value = "ບໍ່ສາມາດຕິດຕາມຕຳແໜ່ງໄດ້"
    return
  }

  locationError.value = null

  return new Promise<void>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLat = position.coords.latitude
        const newLng = position.coords.longitude
        const accuracy = position.coords.accuracy

        latitude.value = newLat
        longitude.value = newLng
        locationAccuracy.value = accuracy
        lastCheckTime.value = new Date()

        const distance = haversine(companyLatitude, companyLongitude, newLat, newLng)
        distanceFromCompany.value = distance

        // เก็บประวัติ
        locationHistory.value.unshift({
          timestamp: new Date(),
          lat: newLat,
          lng: newLng,
          distance,
          accuracy
        })
        
        // เก็บแค่ 10 รายการล่าสุด
        if (locationHistory.value.length > 10) {
          locationHistory.value = locationHistory.value.slice(0, 10)
        }

        const wasInsideCompany = isInsideCompany.value
        
        if (distance <= companyRadius) {
          isInsideCompany.value = true
          clockOutTime.value = null
          
          // แจ้งเตือนเมื่อเข้าบริษัท
          if (!wasInsideCompany) {
            showNotification('ເຂົ້າຄິນີກແລ້ວ', `ທ່ານຢູ່ຫ່າງຈາກຄິນີກ ${Math.round(distance)} ແມັດ`)
          }
        } else {
          isInsideCompany.value = false
          
          // บันทึกเวลาออกงานเฉพาะเมื่อไม่ได้ทำงานนอกสถานที่
          if (!isWorkingOffsite.value && !clockOutTime.value) {
            clockOutTime.value = new Date().toLocaleString('th-TH')
            showNotification('ອອກຈາກຄິນີກແລ້ວ', `ທ່ານຢູ່ຫ່າງຈາກຄິນີກ ${Math.round(distance)} ແມັດ`)
          }
        }

        resolve()
      },
      (error) => {
        let errorMessage = "ບໍ່ສາມາດດຶງຂໍ້ມູນຕຳແໜ່ງໄດ້"
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "ບໍ່ໄດ້ຮັບອະນຸຍາດໃຫ້ເຂົ້າສູນຕຳແໜ່ງ"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "ບໍ່ສາມາດດຶງຕຳແໜ່ງໄດ້"
            break
          case error.TIMEOUT:
            errorMessage = "ເວລາລົງໃນການດຶງຕຳແໜ່ງ"
            break
        }
        
        locationError.value = errorMessage
        console.error("Error getting location:", error)
        resolve()
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000 // ใช้ข้อมูลเก่าได้ 30 วินาที
      }
    )
  })
}

// ติดตามสถานะออนไลน์/ออฟไลน์
const handleOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

// ฟังก์ชันเริ่ม/หยุดการติดตาม
const toggleTracking = () => {
  trackingEnabled.value = !trackingEnabled.value
  if (trackingEnabled.value) {
    startLocationTracking()
  }
}

// ฟังก์ชันล้างประวัติ
const clearHistory = () => {
  locationHistory.value = []
}

// ฟังก์ชันเริ่มการติดตามตำแหน่ง
let locationInterval: ReturnType<typeof setInterval>

const startLocationTracking = () => {
  if (locationInterval) clearInterval(locationInterval)
  
  locationInterval = setInterval(() => {
    if (trackingEnabled.value) {
      checkLocation()
    }
  }, batteryOptimizedInterval.value)
}

// Watch สำหรับการเปลี่ยน interval
watch(batteryOptimizedInterval, () => {
  if (trackingEnabled.value) {
    startLocationTracking()
  }
})

// Watch สำหรับสถานะงานนอกสถานที่
watch(isWorkingOffsite, (newValue) => {
  if (newValue) {
    clockOutTime.value = null // ล้างเวลาออกงานเมื่อเปิดโหมดนอกสถานที่
  } else if (!isInsideCompany.value) {
    clockOutTime.value = new Date().toLocaleString('th-TH') // บันทึกเวลาใหม่เมื่อปิดโหมด
  }
})

onMounted(async () => {
  await requestNotificationPermission()
  
  // Event listeners
  window.addEventListener('online', handleOnlineStatus)
  window.addEventListener('offline', handleOnlineStatus)
  
  // เริ่มการติดตามตำแหน่ง
  await checkLocation() // เช็กครั้งแรก
  startLocationTracking()
})

onBeforeUnmount(() => {
  clearInterval(locationInterval)
  window.removeEventListener('online', handleOnlineStatus)
  window.removeEventListener('offline', handleOnlineStatus)
})

// ฟังก์ชันส่งออกข้อมูล
const exportLocationData = () => {
  const data = {
    currentLocation: { latitude: latitude.value, longitude: longitude.value },
    companyLocation: { latitude: companyLatitude, longitude: companyLongitude },
    distance: distanceFromCompany.value,
    isInsideCompany: isInsideCompany.value,
    clockOutTime: clockOutTime.value,
    isWorkingOffsite: isWorkingOffsite.value,
    history: locationHistory.value,
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `location-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6 font-sans">
    <!-- Header Controls -->
    <div class="flex flex-wrap gap-3 justify-center md:justify-start">
      <button
        @click="checkLocation"
        :disabled="!trackingEnabled"
        class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg shadow transition duration-200"
      >
        📍 ກວດສອບຕຳແໜ່ງໃນຄິນີກ
      </button>

      <button
        @click="toggleTracking"
        :class="trackingEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
        class="text-white px-5 py-2.5 rounded-lg shadow transition duration-200"
      >
        {{ trackingEnabled ? '⏸️ ຢຸດການຕິດຕາມ' : '▶️ ເລີ່ມຕິດຕາມ' }}
      </button>

      <button
        @click="exportLocationData"
        class="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg shadow transition duration-200"
      >
        💾 ສົ່ງອອກຂໍ້ມູນ
      </button>
    </div>

    <!-- Status Cards -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Current Status -->
      <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-md">
        <h3 class="font-bold mb-3 text-gray-800">📊 ສະຖານະປັດຈຸບັນ</h3>
        <p class="text-lg font-semibold" :class="{
          'text-green-600': isInsideCompany,
          'text-yellow-600': isWorkingOffsite,
          'text-red-600': !isInsideCompany && !isWorkingOffsite
        }">
          {{ statusText }}
        </p>
        <div v-if="lastCheckTime" class="text-sm text-gray-500 mt-2">
          ອັບເດດຫຼ້າສຸດ: {{ lastCheckTime.toLocaleString('lo-LA') }}
        </div>
        <div v-if="!isOnline" class="text-red-500 text-sm mt-2">
          ⚠️ ບໍ່ມີການເຊື່ອມຕໍ່ອິນເຕີເນັດ
        </div>
      </div>

      <!-- Location Info -->
      <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-md">
        <h3 class="font-bold mb-3 text-gray-800">📍 ຂໍ້ມູນຕຳແໜ່ງ</h3>
        <div v-if="latitude && longitude" class="space-y-2 text-sm text-gray-700">
          <p>🌍 ພິກັດ: {{ latitude.toFixed(6) }}, {{ longitude.toFixed(6) }}</p>
          <p v-if="distanceFromCompany">
            🔍 ລະຍະທາງ: {{ Math.round(distanceFromCompany) }} ແມັດ
          </p>
          <p v-if="locationAccuracy">
            🎯 ຄວາມແມ່ນຍຳ: ±{{ Math.round(locationAccuracy) }} ແມັດ
          </p>
        </div>
        <p v-if="locationError" class="text-red-500 text-sm mt-2">
          ❌ {{ locationError }}
        </p>
      </div>
    </div>

    <!-- Work Settings -->
    <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-md">
      <h3 class="font-bold text-gray-800 mb-4">⚙️ ການຕັ້ງຄ່າການເຮັດວຽກ</h3>

      <div class="space-y-4">
        <label class="flex items-center space-x-2 text-sm text-gray-700">
          <input type="checkbox" v-model="isWorkingOffsite" class="w-4 h-4 text-blue-500 rounded" />
          <span>📅 ກຳລັງເຮັດວຽກນອກສະຖານທີ່</span>
        </label>

        <div class="flex items-center space-x-3 text-sm">
          <label class="font-medium text-gray-700">⏱️ ຄວາມຖີ່ການກວດສອບ:</label>
          <select v-model="checkInterval" class="border border-gray-300 rounded px-3 py-1">
            <option :value="1000">1 ວິນາທີ</option>
            <option :value="30000">30 ວິນາທີ</option>
            <option :value="60000">1 ນາທີ</option>
            <option :value="300000">5 ນາທີ</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Clock Out -->
    <div v-if="clockOutTime && !isWorkingOffsite" class="bg-orange-100 border border-orange-300 rounded-xl p-5">
      <p class="text-orange-800">
        ⏰ <strong>ເວລາອອກວຽກ:</strong> {{ clockOutTime }}
      </p>
    </div>

    <!-- Location History -->
    <div v-if="locationHistory.length > 0" class="bg-white border border-gray-200 rounded-xl p-5 shadow-md">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-bold text-gray-800">📋 ປະຫວັດຕຳແໜ່ງ</h3>
        <button @click="clearHistory" class="text-red-600 hover:underline text-sm">
          🗑️ ລ້າງປະຫວັດ
        </button>
      </div>
      <div class="max-h-52 overflow-y-auto space-y-2">
        <div
          v-for="(record, index) in locationHistory.slice(0, 5)"
          :key="index"
          class="bg-gray-50 p-3 rounded border text-xs flex justify-between"
        >
          <span>{{ record.timestamp.toLocaleString('lo-LA') }}</span>
          <span :class="record.distance <= companyRadius ? 'text-green-600' : 'text-red-600'">
            {{ Math.round(record.distance) }}m
          </span>
        </div>
      </div>
    </div>

    <!-- Map Links -->
    <div class="grid md:grid-cols-2 gap-3">
      <a
        :href="`https://www.google.com/maps?q=${companyLatitude},${companyLongitude}`"
        target="_blank"
        rel="noopener noreferrer"
        class="block text-blue-600 hover:underline hover:text-blue-800 text-sm border p-3 rounded transition"
      >
        🏢 ເບິ່ງສະຖານທີ່ຄິນີກໃນ Google Maps
      </a>

      <a
        v-if="latitude && longitude"
        :href="`https://www.google.com/maps?q=${latitude},${longitude}`"
        target="_blank"
        rel="noopener noreferrer"
        class="block text-blue-600 hover:underline hover:text-blue-800 text-sm border p-3 rounded transition"
      >
        📍 ເບິ່ງຕຳແໜ່ງຂອງເຈົ້າໃນ Google Maps
      </a>
    </div>
  </div>
</template>


<style scoped>
</style>