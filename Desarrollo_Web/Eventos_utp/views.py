# Desarrollo_Web/Eventos_utp/views.py

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json

from Login.models import Administrador
from .models import Apoyo

# MÉTODO ESPECIAL PARA OBTENER CREDENCIALES DEL ADMIN
def obtener_administrador(request):
    correo = request.session.get('correo_administrador')
    if correo:
        try:
            return Administrador.objects.get(correo_administrador=correo)
        except Administrador.DoesNotExist:
            return None
    return None

def layout(request):
    admin = obtener_administrador(request)
    return render(request, 'layout.html', {'admin': admin})

# VISTA PRINCIPAL DE APOYOS
def index(request):
    # Obtenemos TODOS los apoyos de la base de datos, ordenados por nombre
    lista_de_apoyos = Apoyo.objects.all().order_by('nombre_completo')
    
    admin = obtener_administrador(request)
    
    # Pasamos la lista de apoyos y el admin al contexto de la plantilla
    contexto = {
        'admin': admin,
        'lista_apoyos': lista_de_apoyos
    }
    
    return render(request, 'index.html', contexto)

# VISTA PARA CREAR Y ACTUALIZAR APOYOS (VERSIÓN SEGURA)
@require_POST
def registrar_apoyo(request):
    # Verificación de seguridad: solo administradores logueados pueden continuar
    admin = obtener_administrador(request)
    if not admin:
        return JsonResponse({'error': 'Acceso no autorizado. Por favor, inicie sesión de nuevo.'}, status=401)

    try:
        data = json.loads(request.body)
        apoyo_id = data.get('id')
        nombre_completo = f"{data.get('apellidos', '')} {data.get('nombres', '')}".strip()

        # Validación básica de datos
        if not all([nombre_completo, data.get('dni'), data.get('correo')]):
            return JsonResponse({'error': 'Nombre, DNI y Correo son campos obligatorios.'}, status=400)

        # Si hay un ID, estamos EDITANDO. Si no, estamos CREANDO.
        if apoyo_id:
            # Es una actualización (UPDATE)
            apoyo = get_object_or_404(Apoyo, pk=apoyo_id)
            apoyo.nombre_completo = nombre_completo
            apoyo.telefono = data.get('telefono')
            apoyo.dni = data.get('dni')
            apoyo.ruc = data.get('ruc')
            apoyo.correo = data.get('correo')
            apoyo.save()
            return JsonResponse({'mensaje': 'Apoyo actualizado correctamente'})
        else:
            # Es una creación (CREATE)
            Apoyo.objects.create(
                nombre_completo=nombre_completo,
                telefono=data.get('telefono'),
                dni=data.get('dni'),
                ruc=data.get('ruc'),
                correo=data.get('correo')
            )
            return JsonResponse({'mensaje': 'Apoyo registrado correctamente'}, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error en el servidor: {str(e)}'}, status=500)

# VISTA PARA ELIMINAR APOYOS (VERSIÓN SEGURA)
@require_POST
def eliminar_apoyo(request, apoyo_id):
    # Verificación de seguridad
    admin = obtener_administrador(request)
    if not admin:
        return JsonResponse({'error': 'Acceso no autorizado. Por favor, inicie sesión de nuevo.'}, status=401)

    try:
        apoyo = get_object_or_404(Apoyo, pk=apoyo_id)
        apoyo.delete()
        return JsonResponse({'mensaje': 'Apoyo eliminado correctamente'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# --- OTRAS VISTAS (sin cambios) ---
def promotores(request):
    admin = obtener_administrador(request)
    return render(request, 'promotor.html', {'admin': admin})

def colegios(request):
    admin = obtener_administrador(request)
    return render(request, 'colegios.html', {'admin': admin})

def asistencia(request):
    admin = obtener_administrador(request)
    return render(request, 'asistencia.html', {'admin': admin})

def generador(request):
    admin = obtener_administrador(request)
    return render(request, 'generador.html', {'admin': admin})