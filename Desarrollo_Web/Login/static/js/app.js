document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault()

  const username = document.getElementById('username').value.trim()
  const password = document.getElementById('password').value.trim()
  const errorMessage = document.getElementById('errorMessage')

  if (username === 'admin' && password === '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4') {
    errorMessage.style.display = 'none'
    alert('Acceso concedido. Bienvenido, administrador.')
    // Redirecciona al dashboard real si existe: asd
    // window.location.href = '/admin/dashboard.html'
  } else {
    errorMessage.textContent = 'Usuario o contraseña incorrectos.'
    errorMessage.style.display = 'block'
  }
})

