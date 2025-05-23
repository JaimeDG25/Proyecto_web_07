document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault()

  const username = document.getElementById('username').value.trim()
  const password = document.getElementById('password').value.trim()
  const errorMessage = document.getElementById('errorMessage')

  if (username === 'admin' && password === '1234') {
    errorMessage.style.display = 'none'
    alert('Acceso concedido. Bienvenido, administrador.')
    // Redirecciona al dashboard real si existe: asd
    // window.location.href = '/admin/dashboard.html'
  } else {
    errorMessage.textContent = 'Usuario o contraseña incorrectos.'
    errorMessage.style.display = 'block'
  }
})

