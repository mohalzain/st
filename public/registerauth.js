const usernameField = document.getElementById('username')
const passwordField = document.getElementById('password')
const submitButton = document.querySelector('.auth-button')



submitButton.addEventListener('click',sendData)

function sendData(){
    if(usernameField.value && passwordField.value){
        if (usernameField.value.length > 4){

        }
        if (passwordField.value.length > 10){

        }
        const data = `${usernameField.value}:${passwordField.value}`
        const encoder = new TextEncoder();
        let encoded = encoder.encode(data)
        encoded = String.fromCodePoint(...encoded)
        encoded = btoa(encoded)
        encoded = JSON.stringify({data:encoded})
        fetch('/register',{method:'POST',headers:{ 'Content-Type': 'application/json'},body:encoded})
        .then(data=>{ return data.json()})
        .then(data=>{
            const code = data.userstatus
            const message = data.message
            console.log(code)
            console.log(message)
            window.location.href = './login.html'
        })
    }
}