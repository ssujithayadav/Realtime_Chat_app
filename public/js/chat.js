const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton =  $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.on("message",(message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
      message: message.text,
      createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (message) => {
  console.log(message)
  const html = Mustache.render(locationMessageTemplate, {
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
  
    const message = e.target.elements.message.value

    
    socket.emit('sendMessage', message, (error) => {
      
      $messageFormButton.removeAttribute('disabled')
      $messageFormInput.value = ''
      $messageFormInput.focus()

      if(error){
        return console.log(error)
      }
      console.log('message-delivered')
    })
})

$sendLocationButton.addEventListener('click', () => {
  
  if(!navigator.geolocation){
    return  alert('geolocation is not supported by your browser')

  }

  $sendLocationButton.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('send-location', {
        latitude : position.coords.latitude,
        longitude : position.coords.longitude
    }, () => {
        $sendLocationButton.removeAttribute('disabled')
        console.log('location shared!')
    })
   
    
  })
})

socket.emit('join', {username, room})

