<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// พิกัดของบริษัท
const companyLatitude = 18.01000862090247
const companyLongitude = 102.63258630394976

// พิกัดที่ดึงจาก Geolocation API
const latitude = ref<number | null>(null)
const longitude = ref<number | null>(null)
const isInsideCompany = ref(false)
const distanceFromCompany = ref<number | null>(null) // เพิ่มตัวแปรเก็บระยะห่าง
const clockOutTime = ref<string | null>(null) // เวลาออกงาน
const isWorkingOffsite = ref(false) // เพิ่มสถานะงานนอกสถานที่

// ฟังก์ชัน Haversine สำหรับคำนวณระยะห่าง
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180; // deg2rad
  const dLon = (lon2 - lon1) * Math.PI / 180; // deg2rad
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// ฟังก์ชันตรวจสอบตำแหน่งและคำนวณระยะห่าง
const checkLocation = async () => {
  if (!navigator.geolocation) {
    console.error("Geolocation not supported")
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      latitude.value = position.coords.latitude
      longitude.value = position.coords.longitude

      const distanceInKm = await haversine(
        companyLatitude,
        companyLongitude,
        latitude.value,
        longitude.value
      )

      distanceFromCompany.value = distanceInKm * 1000

      if (distanceInKm <= 0.03) {
        isInsideCompany.value = true
        clockOutTime.value = null
      } else {
        isInsideCompany.value = false
        if (!isWorkingOffsite.value && !clockOutTime.value) {
          clockOutTime.value = new Date().toLocaleString()
        }
      }
    },
    (error) => {
      console.error("Error getting location:", error)
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,        // 10 วินาที
      maximumAge: 0          // ไม่ใช้ข้อมูลเก่า
    }
  )

}

// ฟังก์ชันตรวจสอบตำแหน่งเป็นระยะ
let locationInterval: ReturnType<typeof setInterval>

onMounted(() => {
  // เริ่มการตรวจสอบตำแหน่งทุกๆ 30 วินาที
  locationInterval = setInterval(checkLocation, 30000) // ทุกๆ 30 วินาที
})

onBeforeUnmount(() => {
  // หยุดการตรวจสอบเมื่อคอมโพเนนต์ถูกลบ
  clearInterval(locationInterval)
})

// ฟังก์ชันที่ใช้สำหรับการเลือกสถานะงานนอกสถานที่
// const toggleOffsiteStatus = () => {
//   isWorkingOffsite.value = !isWorkingOffsite.value
// }

</script>

<template>
  <div class="p-4">
    <button @click="checkLocation" class="bg-blue-500 text-white px-4 py-2 rounded">
      📍 เช็กตำแหน่งในบริษัท
    </button>

    <div v-if="latitude && longitude">
      <p>🌍 ตำแหน่งของคุณ: {{ latitude }}, {{ longitude }}</p>
      <p>🔍 ระยะห่างจากบริษัท: {{ distanceFromCompany }} เมตร</p>
      <p v-if="isInsideCompany">✅ คุณอยู่ในบริษัท</p>
      <p v-else>❌ คุณอยู่นอกบริษัท</p>
      <p v-if="clockOutTime">⏰ เวลาออกงาน: {{ clockOutTime }}</p>
    </div>

    <div class="mt-4">
      <label>
        <input type="checkbox" v-model="isWorkingOffsite" />
        📅 กำลังทำงานนอกสถานที่
      </label>
    </div>

    <a class="text-blue-600 underline" :href="`https://www.google.com/maps?q=${companyLatitude},${companyLongitude}`"
      target="_blank" rel="noopener noreferrer">
      🔗 ดูตำแหน่งบริษัทบน Google Maps
    </a>

    <a class="text-blue-600 underline" :href="`https://www.google.com/maps?q=${latitude},${longitude}`" target="_blank"
      rel="noopener noreferrer">
      🔗 ดูตำแหน่งของคุณบน Google Maps
    </a>
  </div>
</template>
