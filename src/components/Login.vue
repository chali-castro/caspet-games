<script setup lang="ts">
import { ref } from 'vue';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useFirebaseAuth } from 'vuefire';

const auth = useFirebaseAuth();
const email = ref('');
const password = ref('');

const login = async () =>
{
    if (auth) {
        await signInWithEmailAndPassword(auth, email.value, password.value);
    }
};

// const adsbygoogle = ref();

// onMounted(async () =>
// {
//     await nextTick();
//     const window: any = document.defaultView;
//     console.log(window.adsbygoogle, adsenseClient);
//     console.log(window);
//     if (adsbygoogle.value && window.adsbygoogle) {
//         (adsbygoogle.value = window.adsbygoogle || []).push({});
//     }
// });

</script>
<template>
    <v-main class="d-flex align-center justify-center">
        <v-container>
            <v-row>
                <v-col style="height: 50vh;">
                    <v-form>
                        <v-text-field label="Email"
                            v-model="email" />
                        <v-text-field label="Password"
                            type="password"
                            v-model="password" />
                        <v-btn @click="login">Login</v-btn>
                    </v-form>
                </v-col>
            </v-row>
            <!-- <v-row>
                <v-col style="height: 30vh;">
                    <ins ref="adsbygoogle"
                        class="adsbygoogle"
                        style="display:block"
                        data-ad-client="ca-pub-2014966493239600"
                        data-ad-slot="8709646296"
                        data-full-width-responsive="true"
                        data-ad-format="auto"></ins>
                </v-col>
            </v-row> -->
        </v-container>
    </v-main>
</template>