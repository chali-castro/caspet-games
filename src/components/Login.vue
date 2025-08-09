<script setup lang="ts">
import { ref } from 'vue';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const email = ref('');
const password = ref('');

const login = async () =>
{
    await signInWithEmailAndPassword(auth, email.value, password.value);
};
</script>
<template>
    <v-main class="d-flex align-center justify-center">
        <v-container>
            <v-form>
                <v-text-field label="Email"
                    v-model="email" />
                <v-text-field label="Password"
                    type="password"
                    v-model="password" />
                <v-btn @click="login">Login</v-btn>
            </v-form>
        </v-container>
    </v-main>
</template>