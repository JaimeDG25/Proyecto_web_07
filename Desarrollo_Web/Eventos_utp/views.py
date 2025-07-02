# Desarrollo_Web/Eventos_utp/views.py

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json

from Login.models import Administrador
from .models import Apoyo,Promotor,Colegio

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
#==============================================================================================================
#=====================================VISTA PARA GENERAR APOYOS ===============================================
# VISTA PRINCIPAL DE APOYOS
def index(request):
    lista_de_apoyos = Apoyo.objects.all().order_by('nombre_completo_apoyo')  
    admin = obtener_administrador(request)
    contexto = {
        'admin': admin,
        'lista_apoyos': lista_de_apoyos
    }
    return render(request, 'index.html', contexto)

# VISTA PARA CREAR Y ACTUALIZAR APOYOS (VERSIÓN SEGURA)
@require_POST
def registrar_apoyo(request):
    admin = obtener_administrador(request)
    if not admin:
        return JsonResponse({'error': 'Acceso no autorizado. Por favor, inicie sesión de nuevo.'}, status=401)
    try:
        data = json.loads(request.body)
        apoyo_id = data.get('id')
        nombre_completo = f"{data.get('apellidos', '')} {data.get('nombres', '')}".strip()
        if not all([nombre_completo, data.get('dni'), data.get('correo')]):
            return JsonResponse({'error': 'Nombre, DNI y Correo son campos obligatorios.'}, status=400)
        if apoyo_id:
            apoyo = get_object_or_404(Apoyo, pk=apoyo_id)
            apoyo.nombre_completo_apoyo = nombre_completo
            apoyo.telefono_apoyo = data.get('telefono')
            apoyo.dni_apoyo = data.get('dni')
            apoyo.ruc_apoyo = data.get('ruc')
            apoyo.correo_apoyo = data.get('correo')
            apoyo.save()
            return JsonResponse({'mensaje': 'Apoyo actualizado correctamente'})
        else:
            Apoyo.objects.create(
                nombre_completo_apoyo=nombre_completo,
                telefono_apoyo=data.get('telefono'),
                dni_apoyo=data.get('dni'),
                ruc_apoyo=data.get('ruc'),
                correo_apoyo=data.get('correo')
            )
            return JsonResponse({'mensaje': 'Apoyo registrado correctamente'}, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error en el servidor: {str(e)}'}, status=500)
# VISTA PARA ELIMINAR APOYOS (VERSIÓN SEGURA)
@require_POST
def eliminar_apoyo(request, apoyo_id):
    admin = obtener_administrador(request)
    if not admin:
        return JsonResponse({'error': 'Acceso no autorizado. Por favor, inicie sesión de nuevo.'}, status=401)
    try:
        apoyo = get_object_or_404(Apoyo, pk=apoyo_id)
        apoyo.delete()
        return JsonResponse({'mensaje': 'Apoyo eliminado correctamente'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
#==============================================================================================================

#==============================================================================================================
#==================================== VISTA PARA GENERAR PROMOTORES ===========================================
# --- OTRAS VISTAS (sin cambios) ---
def promotores(request):
    lista_de_promotores = Promotor.objects.all().order_by('nombre_completo_promotor')
    admin = obtener_administrador(request)
    contexto = {
        'admin': admin,
        'lista_promotores': lista_de_promotores
    }
    return render(request, 'promotor.html', contexto)
# VISTA PARA CREAR Y ACTUALIZAR APOYOS (VERSIÓN SEGURA)
@require_POST
def registrar_promotor(request):
    admin = obtener_administrador(request)
    if not admin:
        return JsonResponse({'error': 'Acceso no autorizado. Por favor, inicie sesión de nuevo.'}, status=401)
    try:
        data = json.loads(request.body)
        promotor_id = data.get('id')
        nombre_completo = f"{data.get('apellidosPromotor', '')} {data.get('nombresPromotor', '')}".strip()
        if not all([nombre_completo, data.get('dniPromotor'), data.get('correoPromotor')]):
            return JsonResponse({'error': 'Nombre, DNI y Correo son campos obligatorios.'}, status=400)
        if promotor_id:
            promotor = get_object_or_404(Promotor, pk=promotor_id)
            promotor.nombre_completo_promotor = nombre_completo
            promotor.telefono_promotor = data.get('telefonoPromotor')
            promotor.dni_promotor = data.get('dniPromotor')
            promotor.codigo_promotor = data.get('codigoPromotor')
            promotor.correo_promotor = data.get('correoPromotor')
            promotor.save()
            return JsonResponse({'mensaje': 'Apoyo actualizado correctamente'})
        else:
            Promotor.objects.create(
                nombre_completo_promotor=nombre_completo,
                telefono_promotor=data.get('telefonoPromotor'),
                dni_promotor=data.get('dniPromotor'),
                codigo_promotor=data.get('codigoPromotor'),
                correo_promotor=data.get('correoPromotor')
            )
            return JsonResponse({'mensaje': 'Apoyo registrado correctamente'}, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error en el servidor: {str(e)}'}, status=500)
#==============================================================================================================

#==============================================================================================================
#===================================== VISTA PARA GENERAR COLEGIOS ============================================
def colegios(request):
    lista_de_colegios = Colegio.objects.all().order_by('nombre_colegio')
    admin = obtener_administrador(request)
    lista_de_promotores = Promotor.objects.all()
    return render(request, 'colegios.html', {'admin': admin, 'promotores_list': lista_de_promotores, 'lista_colegios':lista_de_colegios})
# VISTA PARA CREAR Y ACTUALIZAR APOYOS (VERSIÓN SEGURA)
@require_POST
def registrar_colegio(request):
    admin = obtener_administrador(request)
    if not admin:
        return JsonResponse({'error': 'Acceso no autorizado. Por favor, inicie sesión de nuevo.'}, status=401)
    try:
        data = json.loads(request.body)
        promotor_id = data.get('promotorColegio')
        print(data)
        colegio_id = data.get('id')
        nombre_completo = f"{data.get('apellidosEncargadoColegio', '')} {data.get('nombreEncargadoColegio', '')}".strip()
        if not all([nombre_completo, promotor_id, data.get('nombreColegio')]):
            return JsonResponse({'error': 'Soy un piero y no encuentro el error.'}, status=400)
        promotor = get_object_or_404(Promotor, pk=promotor_id)
        if colegio_id:
            colegio = get_object_or_404(Colegio, pk=colegio_id)
            colegio.nombre_colegio = data.get('nombreColegio')
            colegio.promotor_colegio = promotor
            colegio.nombre_completo_encargado_colegio = nombre_completo
            colegio.telefono_encargado_colegio = data.get('telefonoEncargadoColegio')
            colegio.distrito_colegio = data.get('distritoColegio')
            colegio.link_ubicacion_colegio = data.get('linkUbicacionColegio')
            colegio.archivo_excel_colegio = data.get('archivoBdColegio')
            colegio.save()
            return JsonResponse({'mensaje': 'Apoyo actualizado correctamente'})
        else:
            Colegio.objects.create(
                nombre_colegio=data.get('nombreColegio'),
                promotor_colegio=promotor,
                nombre_completo_encargado_colegio=nombre_completo,
                telefono_encargado_colegio= data.get('telefonoEncargadoColegio'),
                distrito_colegio= data.get('distritoColegio'),
                link_ubicacion_colegio= data.get('linkUbicacionColegio'),
                archivo_excel_colegio= data.get('archivoBdColegio')
            )
            return JsonResponse({'mensaje': 'Apoyo registrado correctamente'}, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error en el servidor: {str(e)}'}, status=500)
#==============================================================================================================

#==============================================================================================================
#==================================== VISTA PARA GENERAR PROMOTORES ===========================================
def asistencia(request):
    admin = obtener_administrador(request)
    return render(request, 'asistencia.html', {'admin': admin})
#==============================================================================================================

#==============================================================================================================
#===================================== VISTA PARA GENERAR OCs Y NRs ===========================================
def generador(request):
    admin = obtener_administrador(request)
    return render(request, 'generador.html', {'admin': admin})
#==============================================================================================================