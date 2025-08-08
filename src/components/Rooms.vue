<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { firestore } from '../firebase'; // Assuming you have a firebase.js file exporting 'db'
import { collection, getDocs } from 'firebase/firestore';
import { CRoom } from '../model/room';

const rooms = ref<Array<CRoom>>([]);

onMounted(async () =>
{
  const querySnapshot = await getDocs(collection(firestore, 'rooms'));
  rooms.value = querySnapshot.docs.map(doc => new CRoom(doc.id, doc.data()));
});
</script>

<template>
  <div>
    <h2>Rooms</h2>
    <ul>
      <li v-for="room in rooms" :key="room.id">{{ room.name }}</li>
    </ul>
  </div>
</template>


<style scoped>
/* Add your styles here */
</style>