

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
        fetch('/login',{method:'POST',headers:{ 'Content-Type': 'application/json'},body:encoded})
    }
}