<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const isCasting = ref(false);

const initializeCastApi = () =>
{
  //@ts-ignore
  const castContext = cast.framework.CastContext.getInstance().setOptions({
    //@ts-ignore
    receiverApplicationId: '5CB45E5A', //chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    //@ts-ignore
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED, // Opcional is PAGE_SCOPED 
    androidReceiverCompatible: true
  });

  //@ts-ignore
  const remotePlayer = new cast.framework.RemotePlayer();

  //@ts-ignore
  const remotePlayerController = new cast.framework.RemotePlayerController(remotePlayer);

  remotePlayerController.addEventListener(
    //@ts-ignore
    cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
    (e: any) =>
    {
      isCasting.value = e.value;
    });
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

watch(() => isCasting.value, async () =>
{
  if (isCasting.value) {
    //@ts-ignore
    let castSession = cast.framework.CastContext.getInstance().getCurrentSession();

    const url = `https://caspet-games.web.app${route.path}`;

    //@ts-ignore
    await castSession.sendMessage('urn:x-cast:com.url.cast', { type: 'loc', url: url }, () => { console.log('enviado'); }, (e) => { console.log(e); });
  }
});

onMounted(() =>
{
  let scriptTag = document.createElement('script');
  scriptTag.src = '//www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
  document.head.appendChild(scriptTag);
});

</script>
<template>
  <google-cast-launcher style="height: 25px;" />
</template>