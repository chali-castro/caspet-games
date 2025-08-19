<script setup lang="ts">
import { onMounted, ref } from 'vue';
import router from '../router';

const isCasting = ref(false);
const castContext = ref();

// function startCasting() {
//   isCasting.value = true;
//   // Logic to start casting


// }

// function stopCasting() {
//   isCasting.value = false;
//   // Logic to stop casting
// }

const initializeCastApi = () =>
{
  //@ts-ignore
  castContext.value = cast.framework.CastContext.getInstance();
  //@ts-ignore
  cast.framework.CastContext.getInstance().setOptions({
    //@ts-ignore
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    //@ts-ignore
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
  });

  castContext.value.addEventListener(
    //@ts-ignore
    cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
    (event: { sessionState: any; }) =>
    {
      switch (event.sessionState) {
        //@ts-ignore
        case cast.framework.SessionState.SESSION_STARTED:
        //@ts-ignore
        case cast.framework.SessionState.SESSION_RESUMED:
          console.log('CastContext: CastSession started');
          castContent().then(() => { console.log('Enviado?'); });
          break;
        //@ts-ignore
        case cast.framework.SessionState.SESSION_ENDED:
          console.log('CastContext: CastSession disconnected');
          // Update locally as necessary
          break;
      }
    }
  );
};

//@ts-ignore
window['__onGCastApiAvailable'] = (isAvailable: boolean) =>
{
  if (isAvailable) {
    // Initialize the Cast API or any other setup needed
    console.log('Google Cast API is available');
    initializeCastApi();
  } else {
    console.error('Google Cast API is not available');
  }
};

const castContent = async () =>
{
  try {
    //@ts-ignore
    var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    console.log(castSession);
    const url = 'https://es.wikipedia.org/wiki/Wikipedia:Portada';
    //@ts-ignore
    var mediaInfo = new chrome.cast.media.MediaInfo(url, 'text/html');
    //@ts-ignore
    mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = 'Caso de prueba';
    mediaInfo.metadata.subtitle = url;
    //@ts-ignore
    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    await castSession.loadMedia(request);
    console.log('loaded');
  }
  catch (e) {
    console.log(e);
  }
};

onMounted(() =>
{
  let scriptTag = document.createElement('script');
  scriptTag.src = '//www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
  document.head.appendChild(scriptTag);

  // window['__onGCastApiAvailable'] = function(isAvailable) {
  // if (isAvailable) {
  //   initializeCastApi();
  // }
  // };
});

</script>
<template>
  <google-cast-launcher style="height: 25px;" />
  <!-- <v-btn icon  @click="isCasting ? stopCasting() : startCasting()">
    {{ isCasting ? 'Stop Casting' : 'Start Casting' }}
    <v-icon>{{ isCasting ? 'mdi-cast-connected' : 'mdi-cast' }}</v-icon>
  </v-btn> -->
</template>