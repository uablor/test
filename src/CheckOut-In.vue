<template>
    <div class="drag-toggle-wrapper">
        <div class="drag-toggle-track" @mousedown="startDrag" @touchstart="startDrag" :class="{ 'checked': isChecked }">
            <div class="drag-toggle-thumb" ref="thumb" :style="{ transform: `translateX(${thumbX}px)` }" />
        </div>

        <p class="status-text">
            <strong>{{ isChecked ? 'ເຂົ້າງານແລ້ວ' : '' }}</strong>
        </p>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const isChecked = ref(false)
const thumbX = ref(2)
const dragging = ref(false)

let startX = 0
let currentX = 0
let trackWidth = 0
let thumbWidth = 0
let maxX = 0

const startDrag = (e) => {
    dragging.value = true
    startX = e.touches ? e.touches[0].clientX : e.clientX
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
    document.addEventListener('touchmove', onDrag)
    document.addEventListener('touchend', stopDrag)
}

const onDrag = (e) => {
    if (!dragging.value) return
    currentX = e.touches ? e.touches[0].clientX : e.clientX
    let dx = currentX - startX
    let newX = isChecked.value ? maxX + dx : dx
    thumbX.value = Math.max(2, Math.min(maxX, newX))
}

const stopDrag = () => {
    dragging.value = false
    isChecked.value = thumbX.value > maxX / 2
    thumbX.value = isChecked.value ? maxX : 2

    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('touchmove', onDrag)
    document.removeEventListener('touchend', stopDrag)
}

onMounted(() => {
    nextTick(() => {
        const track = document.querySelector('.drag-toggle-track')
        trackWidth = track.offsetWidth
        thumbWidth = 36
        maxX = trackWidth - thumbWidth - 2
        thumbX.value = isChecked.value ? maxX : 2
    })
})
</script>

<style scoped lang="scss">
.drag-toggle-wrapper {
    width: 90%;
    margin: 0 auto;
    padding: 30px;
    text-align: center;
}

.drag-toggle-track {
    width: 90%;
    height: 40px;
    background-color: #ddd;
    border-radius: 999px;
    position: relative;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin: 0 auto;

    &.checked {
        background-color: #08bbf1;
    }

    .drag-toggle-thumb {
        width: 36px;
        height: 36px;
        background-color: white;
        border-radius: 50%;
        position: absolute;
        top: 2px;
        left: 0;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        transition: transform 0.3s ease;
        touch-action: none;
    }
}

.status-text {
    margin-top: 16px;
    width: 90%;
    margin-inline: auto;
}
</style>
