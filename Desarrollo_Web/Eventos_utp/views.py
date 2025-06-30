from django.shortcuts import render
from Login.models import Administrador 
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
            print("Nombre completo:", data.get('nombre'),data.get('apellido'))
            print("Teléfono:", data.get('telefono'))
            print("DNI:", data.get('dni'))
            print("RUC:", data.get('ruc'))
            print("Correo:", data.get('correo'))
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
