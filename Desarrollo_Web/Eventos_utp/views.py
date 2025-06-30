from django.shortcuts import render
from Login.models import Administrador
from Eventos_utp.models import Apoyo 
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt

# IMPORTACIONES DE RECURSOS
from .Sources.src_apoyos import CN_Apoyos

#METODO ESPECIAL PARA OBTENER CREDENCIALES DEL ADMIN
def obtener_administrador(request):
    correo = request.session.get('correo_administrador')
    if correo:
        try:
            return Administrador.objects.get(correo_administrador=correo)
        except Administrador.DoesNotExist:
            return None
    return None

def layout (request):
    admin = obtener_administrador(request)
    if admin:
        return render(request, 'layout.html', {'admin': admin})
    return render(request, 'layout.html')

def index (request):
    consulta=CN_Apoyos.Listar_Apoyos()
    print(consulta)   
    admin = obtener_administrador(request)
    if admin:
        return render(request, 'index.html', {'admin': admin})
    return render(request, 'index.html')

@csrf_exempt
def registrar_apoyo(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)  # ← aquí obtienes los datos JSON
            nombre_completo= data.get('nombre', '') + ' ' + data.get('apellido', '')
            telefono = data.get('telefono')
            dni = data.get('dni')
            ruc = data.get('ruc')
            correo= data.get('correo')
            print("Nombre completo:", nombre_completo)
            print("Teléfono:", telefono)
            print("DNI:", dni)
            print("RUC:", ruc)
            print("Correo:", correo)
            nuevo_apoyo = Apoyo(
                nombre_completo = nombre_completo,
                telefono = telefono,
                dni = dni,
                ruc = ruc,
                correo= correo
            )
            nuevo_apoyo.save()
            return JsonResponse({'mensaje': 'Apoyo registrado correctamente'})
        except Exception as e:
            print("Error al registrar apoyo:", e)
            return JsonResponse({'error': 'Error en el servidor'}, status=500)
    return JsonResponse({'error': 'Método no permitido'}, status=405)


def promotores (request):
    admin = obtener_administrador(request)
    if admin:
        return render(request, 'promotor.html', {'admin': admin})
    return render(request, 'promotor.html')

def colegios (request):
    admin = obtener_administrador(request)
    if admin:
        return render(request, 'colegios.html', {'admin': admin})
    return render(request, 'colegios.html')

def asistencia (request):
    admin = obtener_administrador(request)
    if admin:
        return render(request, 'asistencia.html', {'admin': admin})
    return render(request, 'asistencia.html')

def generador (request):
    admin = obtener_administrador(request)
    if admin:
        return render(request, 'generador.html', {'admin': admin})
    return render(request, 'generador.html')
