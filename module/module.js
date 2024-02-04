const fetch = require('node-fetch');

async function getvmlist(apikey, slug) {

  try {
    const url = await fetch(`https://api.idcloudhost.com/v1/${slug}/user-resource/vm/list`, {
      headers: {
        'apikey': `${apikey}`
      }
    });
    const respon = await url.json()

    return { respon }
  } catch (error) {
    return { error }
  }
}




async function getvmingfo(apikey, vmid, slug) {

  try {
    const url = await fetch(`https://api.idcloudhost.com/v1/${slug}/user-resource/vm?uuid=${vmid}`, {
      headers: {
        'apikey': `${apikey}`
      }
    });

    const respon = await url.json()

    return { respon }
  } catch (error) {
    return { error }
  }
}


async function startvm(apikey, vmid) {


  try {
    const url = await fetch('https://api.idcloudhost.com/v1/user-resource/vm/start', {
      method: 'POST',
      headers: {
        'apikey': `${apikey}`
      },
      body: new URLSearchParams({
        'uuid': `${vmid}`
      })
    });

    const respon = await url.json();

    return { respon }
  } catch (error) {
    return { error }
  }
}


async function stopvm(apikey, vmid) {

  try {
    const url = await fetch('https://api.idcloudhost.com/v1/user-resource/vm/stop', {
      method: 'POST',
      headers: {
        'apikey': `${apikey}`
      },
      body: new URLSearchParams({
        'uuid': `${vmid}`
      })
    });

    const respon = await url.json();

    return { respon }
  } catch (error) {
    return { error }
  }
}



async function auth(apikey) {

  try {
    const url = await fetch('https://api.idcloudhost.com/v1/user-resource/user', {
      headers: {
        'apikey': `${apikey}`
      }
    });

    const respon = await url.json();

    return { respon }
  } catch (error) {
    return { error }
  }
}


async function getlocation(apikey) {
  

  try {
    const url = await fetch('https://api.idcloudhost.com/v1/config/locations', {
      headers: {
        'apikey': `${apikey}`
      }
    });

    const respon = await url.json()

    return { respon }
  } catch (error) {
    return { respon }
  }
}
module.exports = {
  getvmlist,
  getvmingfo,
  startvm,
  stopvm,
  auth,
  getlocation,
}