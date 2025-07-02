from django.shortcuts import render,redirect
from django.http import HttpResponse
from .models import Administrador
from .Sources.src_contraseña import generar_clave,convertir_hash
from .Sources.src_enviar_correo import Enviar_correo
from .FireStore.fs_registro import CN_Administrador
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

#============================= Vista generada para el login inicial del administrador ================================
#Vista para Renderizar el login
def login (request):
    usuarios = Administrador.objects.all()
    for user in usuarios:
        print(user.id_administrador)
        print(user.correo_administrador)
        print(user.contraseña_administrador)
    return render(request, 'login.html')

#Vista generada para redireccionar de regreso al login
def redirigir_a_login(request):
    return redirect('login_vista')

#Metodo para enviar los datos del login y acceder al programa
def enviar_datos(request):
    if request.method == 'POST':
        correo = request.POST.get('correo')
        contraseña = request.POST.get('contraseña')
        try:
            existe = Administrador.objects.get(
                correo_administrador=correo,
                contraseña_administrador=convertir_hash(contraseña)
            )
            if existe:
                request.session['correo_administrador'] = correo
                return redirect('index_link')
        except Administrador.DoesNotExist:
            # Opcional: mensaje de error
            return render(request, 'login.html', {'error': 'Credenciales incorrectas'})
    return render(request, 'login.html')

#Metodo para cerrar session
def cerrar_sesion(request):
    return render(request, 'login.html')
#=====================================================================================================================

#============================= Vista generada para el login inicial del administrador ================================
#Metodo para dirigir a la vista y enviar una clave al jefe admin
def codigo_vista(request):
    clave_generada=generar_clave()
    clave_hasheada=convertir_hash(clave_generada)
    Enviar_correo("garciajhair22@gmail.com",clave_generada)
    request.session['clave_hasheada'] = clave_hasheada
    return render(request,'codigo.html')

#Metodo para validar el codigo y dirigir al registro de nuevos jefes
def enviar_codigo(request):
    if request.method == 'POST':
        codigo = request.POST.get('codigo')
        clave_guardada = request.session.get('clave_hasheada')
        codigo_hasehado = convertir_hash(codigo)
        if codigo_hasehado == clave_guardada:
            return render(request, 'registro.html')
        else:
            return render(request, 'codigo.html', {'error': 'Código incorrecto'})
    return redirect('codigo_vista') 
#=====================================================================================================================

#============================= Vista generada para el login inicial del administrador ================================
#Metodo para dirigir a la vista de registro
def registro_vista(request):
    clave_generada=generar_clave()
    clave_hasheada=convertir_hash(clave_generada)
    return render(request, 'registro.html',{'clave_generada':clave_generada,'clave_hasheada':clave_hasheada})

@csrf_exempt 
def enviar_registro(request):
    if request.method == 'POST':
        data = json.loads(request.body)   
        nombre = data.get('nombre')
        apellido = data.get('apellido')
        correo = data.get('correo')
        sede = data.get('sede')

        error = CN_Administrador.validar_registro(nombre, apellido, correo, sede)
        if error:
            return JsonResponse({'error': error}, status=400)
        
        clave_usuario=generar_clave()
        clave_h_usuario=convertir_hash(clave_usuario)
        
        Enviar_correo(correo,clave_usuario)
        
        nuevo_admin = Administrador(
            nombre_administrador=nombre,
            apellido_administrador=apellido,
            correo_administrador=correo,
            contraseña_administrador =clave_h_usuario,
            sede_administrador=sede
        )
        nuevo_admin.save()
        return JsonResponse({'mensaje': 'Administrador registrado correctamente'})
    return JsonResponse({'error': 'Método no permitido'}, status=405)
#=====================================================================================================================