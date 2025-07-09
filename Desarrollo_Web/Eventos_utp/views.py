# Desarrollo_Web/Eventos_utp/views.py

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json
from .FireStore.fs_apoyo import CN_Apoyo
from Login.models import Administrador
from .models import Apoyo,Promotor,Colegio,Asistencia
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
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
        error = CN_Apoyo.validar_registro(data.get('nombres'),data.get('apellidos'),data.get('telefono'),data.get('dni'),data.get('ruc'),data.get('correo'))
        if error:
            return JsonResponse({'error': error}, status=400)
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
        error = CN_Apoyo.validar_registro(data.get('nombresPromotor', ''),data.get('apellidosPromotor', ''),data.get('codigoPromotor'),data.get('telefonoPromotor'),data.get('dniPromotor'),data.get('correoPromotor'))
        if error:
            return JsonResponse({'error': error}, status=400)
        if promotor_id:
            promotor = get_object_or_404(Promotor, pk=promotor_id)
            nuevo_dni = data.get('dniPromotor')
            nuevo_correo = data.get('correoPromotor')

            # Evitar conflictos de duplicado al editar
            if Promotor.objects.exclude(pk=promotor_id).filter(dni_promotor=nuevo_dni).exists():
                return JsonResponse({'error': f'Ya existe un promotor con el DNI {nuevo_dni}.'}, status=400)
            if Promotor.objects.exclude(pk=promotor_id).filter(correo_promotor=nuevo_correo).exists():
                return JsonResponse({'error': f'Ya existe un promotor con el correo {nuevo_correo}.'}, status=400)

            # Si no hay conflictos, se actualiza
            promotor.nombre_completo_promotor = nombre_completo
            promotor.telefono_promotor = data.get('telefonoPromotor')
            promotor.dni_promotor = nuevo_dni
            promotor.codigo_promotor = data.get('codigoPromotor')
            promotor.correo_promotor = nuevo_correo
            promotor.save()
            return JsonResponse({'mensaje': 'Apoyo actualizado correctamente'})
        else:
            dni = data.get('dniPromotor')
            correo = data.get('correoPromotor')
            if Promotor.objects.filter(dni_promotor=dni).exists():
                return JsonResponse({'error': f'Ya existe un promotor registrado con el DNI {dni}.'}, status=400)
            if Promotor.objects.filter(correo_promotor=correo).exists():
                return JsonResponse({'error': f'Ya existe un promotor registrado con el correo {correo}.'}, status=400)
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
    
# VISTA PARA ELIMINAR APOYOS (VERSIÓN SEGURA)
@require_POST
def eliminar_promotor(request, promotor_id):
    admin = obtener_administrador(request)
    if not admin:
        return JsonResponse({'error': 'Acceso no autorizado. Por favor, inicie sesión de nuevo.'}, status=401)
    try:
        promotor = get_object_or_404(Promotor, pk=promotor_id)
        promotor.delete()
        return JsonResponse({'mensaje': 'Apoyo eliminado correctamente'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
#==============================================================================================================

#==============================================================================================================
#===================================== VISTA PARA GENERAR COLEGIOS ============================================
from django.http import HttpResponse
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
    link = request.POST.get('linkUbicacionColegio')
    validate = URLValidator()
    try:
        if link:
            validate(link)
    except ValidationError:
        return JsonResponse({'error': 'El enlace de ubicación no es válido'}, status=400)
    try:
        promotor_id = request.POST.get('promotorColegio')
        colegio_id = request.POST.get('idColegioEditar')  # usa el ID correcto
        nombre_colegio = request.POST.get('nombreColegio')
        apellidos = request.POST.get('apellidosEncargadoColegio')
        nombres = request.POST.get('nombreEncargadoColegio')
        telefono = request.POST.get('telefonoEncargadoColegio')
        distrito = request.POST.get('distritoColegio')
        link = request.POST.get('linkUbicacionColegio')
        archivo = request.FILES.get('archivoBdColegio')
        
        nombre_completo = f"{apellidos} {nombres}".strip()
        if not all([nombre_completo, promotor_id, nombre_colegio]):
            return JsonResponse({'error': 'Al parecer no haz llenado todos los campos requeridos.'}, status=400)
        
        promotor = get_object_or_404(Promotor, pk=promotor_id)
        if archivo:
            contenido_binario = archivo.read()
        if colegio_id:
            colegio = get_object_or_404(Colegio, pk=colegio_id)
            colegio.nombre_colegio = nombre_colegio
            colegio.promotor_colegio = promotor
            colegio.nombre_completo_encargado_colegio = nombre_completo
            colegio.telefono_encargado_colegio = telefono
            colegio.distrito_colegio = distrito
            colegio.link_ubicacion_colegio = link
            if contenido_binario:
                colegio.archivo_excel_colegio = contenido_binario
            colegio.save()
            return JsonResponse({'mensaje': 'Apoyo actualizado correctamente'})
        else:
            Colegio.objects.create(
                nombre_colegio=nombre_colegio,
                promotor_colegio=promotor,
                nombre_completo_encargado_colegio=nombre_completo,
                telefono_encargado_colegio=telefono,
                distrito_colegio=distrito,
                link_ubicacion_colegio=link,
                archivo_excel_colegio=contenido_binario
            )
            return JsonResponse({'mensaje': 'Colegio registrado correctamente'}, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error en el servidor: {str(e)}'}, status=500)
def descargar_archivo(request, colegio_id):
    colegio = get_object_or_404(Colegio, pk=colegio_id)
    if colegio.archivo_excel_colegio:
        response = HttpResponse(colegio.archivo_excel_colegio, content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{colegio.nombre_colegio}.xlsx"'
        return response
    else:
        return JsonResponse({'error': 'Este colegio no tiene archivo.'}, status=404)
#==============================================================================================================

#==============================================================================================================
#==================================== VISTA PARA GENERAR ASISTENCIA ===========================================
# Desarrollo_Web/Eventos_utp/views.py

# ==================================== VISTA PARA GENERAR ASISTENCIA ===========================================
def asistencia(request):
    admin = obtener_administrador(request)
    
    # Obtener datos para los menús desplegables del formulario
    # Usando los nombres de campo correctos de tus modelos
    apoyos = Apoyo.objects.all().order_by('nombre_completo_apoyo')
    colegios = Colegio.objects.all().order_by('nombre_colegio')

    # Obtener los datos de asistencias para mostrar en la tabla
    # Usando select_related con los nombres de campo correctos
    lista_de_asistencias = Asistencia.objects.select_related(
        'apoyo_asistencia', 
        'colegio_asistencia'
    ).all().order_by('-fecha_asistencia')

    contexto = {
        'admin': admin, 
        'apoyos': apoyos, 
        'colegios': colegios,
        'lista_asistencias': lista_de_asistencias
    }
    
    return render(request, 'asistencia.html', contexto)

# VISTA PARA CREAR Y ACTUALIZAR ASISTENCIA (VERSIÓN SEGURA)
# Desarrollo_Web/Eventos_utp/views.py

@require_POST
def registrar_asistencia (request):
    admin = obtener_administrador(request)
    if not admin:
        return JsonResponse({'error': 'Acceso no autorizado'}, status=401)
    
    try:
        data = json.loads(request.body)
        
        # Obtenemos los objetos relacionados
        apoyo = get_object_or_404(Apoyo, pk=data.get('apoyoAsistencia'))
        colegio = get_object_or_404(Colegio, pk=data.get('colegioAsistencia'))
        
        asistencia_id = data.get('id')

        if asistencia_id: # --- LÓGICA DE EDICIÓN CORREGIDA ---
            asistencia = get_object_or_404(Asistencia, pk=asistencia_id)
            asistencia.apoyo_asistencia = apoyo
            asistencia.colegio_asistencia = colegio
            asistencia.rol_asistencia = data.get('rolAsistencia')
            asistencia.turno_asistencia = data.get('turnoAsistencia')
            asistencia.fecha_asistencia = data.get('fechaAsistencia')
            asistencia.save()
            return JsonResponse({'mensaje': 'Asistencia actualizada correctamente'})
        else: # --- LÓGICA DE CREACIÓN CORREGIDA ---
            Asistencia.objects.create(
                apoyo_asistencia=apoyo,
                colegio_asistencia=colegio,
                fecha_asistencia=data.get('fechaAsistencia'),
                rol_asistencia=data.get('rolAsistencia'),
                turno_asistencia=data.get('turnoAsistencia'),
                asistencia_asistencia=False # Valor por defecto
            )
            return JsonResponse({'mensaje': 'Asistencia planificada correctamente'}, status=201)

    except Exception as e:
        return JsonResponse({'error': f'Error en el servidor: {str(e)}'}, status=500)
    
# VISTA PARA ELIMINAR ASISTENCIA (VERSIÓN SEGURA)
@require_POST
def eliminar_asistencia(request, asistencia_id):
    """Elimina una planificación de asistencia."""
    if not obtener_administrador(request):
        return JsonResponse({'error': 'Acceso no autorizado'}, status=401)
    try:
        asistencia = get_object_or_404(Asistencia, pk=asistencia_id)
        asistencia.delete()
        return JsonResponse({'mensaje': 'Planificación eliminada'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@require_POST
def confirmar_asistencia_estado(request, asistencia_id, estado):
    """
    Marca una asistencia como 'asistio' o 'cancelo', calcula el pago
    y lo guarda en la base de datos.
    """
    admin = obtener_administrador(request)
    if not admin:
        return JsonResponse({'error': 'Acceso no autorizado'}, status=401)
    
    if estado not in ['asistio', 'cancelo']:
        return JsonResponse({'error': 'Estado no válido'}, status=400)

    try:
        asistencia = get_object_or_404(Asistencia, pk=asistencia_id)
        
        # --- LÓGICA DE CÁLCULO DE PAGO ---
        monto_a_pagar = 0
        if estado == 'asistio':
            if asistencia.rol_asistencia == 'bus':
                monto_a_pagar = 50.00
            elif asistencia.rol_asistencia == 'campus':
                monto_a_pagar = 40.00
            # Puedes añadir más roles aquí si los tienes en el futuro
        elif estado == 'cancelo':
            monto_a_pagar = 20.00
        
        # --- ACTUALIZAR LA ASISTENCIA EN LA BASE DE DATOS ---
        asistencia.asistencia_asistencia = True # La marca como confirmada
        asistencia.monto_pagado_asistencia = monto_a_pagar # Guarda el monto calculado
        asistencia.save()
        
        mensaje = f"Asistencia marcada como '{estado}'. Monto a pagar: S/ {monto_a_pagar:.2f}"
        return JsonResponse({'mensaje': mensaje})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
#==============================================================================================================

#==============================================================================================================
#===================================== VISTA PARA GENERAR OCs Y NRs ===========================================
def generador(request):
    admin = obtener_administrador(request)
    return render(request, 'generador.html', {'admin': admin})
#==============================================================================================================