# Desarrollo_Web/Eventos_utp/views.py

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST,require_GET
import json
from .FireStore.fs_apoyo import CN_Apoyo
from Login.models import Administrador
from .models import Apoyo,Promotor,Colegio,Asistencia,OrdenPago
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from django.db import transaction
from decimal import Decimal
from datetime import date
# Importaciones para WeasyPrint y templates
from weasyprint import HTML, CSS
from django.template.loader import render_to_string
from django.urls import reverse
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
# ===================================== VISTA PARA GENERAR OCs Y NRs ===========================================

# Vista principal para el generador
def generador(request):
    admin = obtener_administrador(request)
    return render(request, 'generador.html', {'admin': admin})

# Función para obtener la lista de apoyos (renombrada de obtener_apoyos_api)
@require_GET
def obtener_apoyos_json(request): # Renombrado
    if not obtener_administrador(request):
        return JsonResponse({'error': 'Acceso no autorizado'}, status=401)
    apoyos = Apoyo.objects.all().order_by('nombre_completo_apoyo')
    data = [{'id': apoyo.id, 'nombre_completo': apoyo.nombre_completo_apoyo} for apoyo in apoyos]
    return JsonResponse(data, safe=False)

# Función para obtener asistencias pendientes de pago para un apoyo (renombrada de obtener_asistencias_pendientes_api)
@require_GET
def obtener_asistencias_pendientes_json(request, apoyo_id): # Renombrado
    if not obtener_administrador(request):
        return JsonResponse({'error': 'Acceso no autorizado'}, status=401)
    try:
        # Ahora usamos el campo `orden_pago` para excluir asistencias que ya están vinculadas a una OrdenPago
        asistencias = Asistencia.objects.filter(
            apoyo_asistencia_id=apoyo_id,
            asistencia_asistencia=True, # Solo asistencias confirmadas
            monto_pagado_asistencia__gt=0 # Solo las que tienen un monto asignado
        ).filter(
            orden_pago__isnull=True # <--- ¡IMPORTANTE! Excluye asistencias que YA tienen una OrdenPago asignada
        ).select_related('colegio_asistencia', 'apoyo_asistencia').order_by('fecha_asistencia')

        data = []
        for asis in asistencias:
            data.append({
                'id': asis.id,
                'fecha': asis.fecha_asistencia.strftime('%d/%m/%Y'),
                'colegio': asis.colegio_asistencia.nombre_colegio,
                'rol': asis.rol_asistencia,
                'turno': asis.turno_asistencia,
                'monto_pagado': str(asis.monto_pagado_asistencia)
            })
        return JsonResponse(data, safe=False)
    except Apoyo.DoesNotExist:
        return JsonResponse({'error': 'Apoyo no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener asistencias: {str(e)}'}, status=500)

@require_GET
def obtener_ordenes_pago_json(request):
    admin = obtener_administrador(request) # Usar la función obtener_administrador
    if not admin: # O si no quieres autenticación para esta vista, puedes quitar esta parte
        return JsonResponse({'error': 'Acceso no autorizado'}, status=401)
    
    ordenes = OrdenPago.objects.select_related('apoyo').prefetch_related('asistencias_incluidas').order_by('-fecha_generacion')
    
    data = []
    for orden in ordenes:
        # **CORRECCIÓN AQUÍ:** Usamos 'descargar_pdf_real' que es el nombre de tu URL real
        pdf_oc_url = request.build_absolute_uri(
            reverse('descargar_pdf_real', kwargs={'tipo': 'oc', 'orden_id': orden.id})
        )
        pdf_nr_url = request.build_absolute_uri(
            reverse('descargar_pdf_real', kwargs={'tipo': 'nr', 'orden_id': orden.id})
        )

        data.append({
            'id': orden.id,
            'numero_documento': orden.numero_documento,
            'apoyo_nombre': orden.apoyo.nombre_completo_apoyo,
            'fecha_generacion': orden.fecha_generacion.strftime('%d/%m/%Y %H:%M'),
            'total_pagado': str(orden.total_pagado),
            'asistencias_incluidas_count': orden.asistencias_incluidas.count(),
            'pdf_oc_url': pdf_oc_url,
            'pdf_nr_url': pdf_nr_url,
        })
    return JsonResponse(data, safe=False)

# Función para obtener la lista de Órdenes de Pago generadas (renombrada de obtener_ordenes_pago_api)
#BORRAR LUEGO
@require_GET
def obtener_ordenes_pago_json_no(request): # Renombrado
    if not obtener_administrador(request):
        return JsonResponse({'error': 'Acceso no autorizado'}, status=401)
    
    # Usamos prefetch_related para obtener las asistencias relacionadas de cada orden de pago
    # de forma eficiente con una sola consulta adicional.
    ordenes = OrdenPago.objects.select_related('apoyo').prefetch_related('asistencias_incluidas').order_by('-fecha_generacion')
    
    data = []
    for orden in ordenes:
        data.append({
            'id': orden.id,
            'numero_documento': orden.numero_documento,
            'apoyo_nombre': orden.apoyo.nombre_completo_apoyo,
            'fecha_generacion': orden.fecha_generacion.strftime('%d/%m/%Y %H:%M'),
            'total_pagado': str(orden.total_pagado),
            'asistencias_incluidas_count': orden.asistencias_incluidas.count(), # <--- ¡Ahora esto funcionará!
            'pdf_oc_url': request.build_absolute_uri(f'/Evento/generador/descargar_pdf_simulado/oc/{orden.id}/'), # URL corregida
            'pdf_nr_url': request.build_absolute_uri(f'/Evento/generador/descargar_pdf_simulado/nr/{orden.id}/') # URL corregida
        })
    return JsonResponse(data, safe=False)

def descargar_pdf_real(request, tipo, orden_id):
    admin = obtener_administrador(request)
    if not admin:
        return HttpResponse("Acceso no autorizado", status=401)

    orden_pago = get_object_or_404(OrdenPago, pk=orden_id)
    asistencias_de_la_orden = orden_pago.asistencias_incluidas.all().select_related('colegio_asistencia')

    tipo_documento_str = ""
    template_file = ""
    context = {} # Inicializamos el contexto aquí

    if tipo.lower() == 'oc':
        tipo_documento_str = "Orden de Compra"
        template_file = 'OC.html' # ¡Asumiendo que has creado este archivo!

        # Datos ESPECÍFICOS para Orden de Compra (OC)
        # Aquí puedes añadir datos adicionales que solo necesita la plantilla OC.html
        context['titulo_oc_especifico'] = "Detalle de Orden de Compra"
        # Por ejemplo, podrías querer un número de referencia diferente o campos de pago específicos
        # context['condiciones_pago_oc'] = "30 días netos"
        # context['metodo_envio_oc'] = "Correo electrónico"

    elif tipo.lower() == 'nr':
        tipo_documento_str = "Nota de Recepción"
        template_file = 'NC.html' # Tu plantilla existente para Nota de Recepción

        # Datos ESPECÍFICOS para Nota de Recepción (NR)
        # Aquí puedes añadir datos adicionales que solo necesita la plantilla NC.html
        context['nota_recepcion_observaciones'] = "Se recibió conforme la totalidad de los servicios."
        # context['fecha_recepcion_nr'] = orden_pago.fecha_generacion.strftime('%d/%m/%Y') # Podría ser diferente a la fecha de OC

    else:
        return HttpResponse("Tipo de documento no válido", status=400)

    # Datos COMUNES para ambos tipos (OC y NR)
    # Estos datos se añaden al contexto base
    context['orden'] = orden_pago
    context['tipo_documento'] = tipo_documento_str
    context['asistencias'] = asistencias_de_la_orden
    context['admin'] = admin
    # ... y cualquier otro dato que ambas plantillas necesiten ...

    try:
        html_string = render_to_string(template_file, context)
    except Exception as e:
        # Manejo de error si la plantilla no se encuentra (ej. OC.html no existe aún)
        return HttpResponse(f"Error al renderizar la plantilla '{template_file}': {str(e)}", status=500)

    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()

    filename = f"{tipo.upper()}-{orden_pago.numero_documento}.pdf"
    response = HttpResponse(pdf_file, content_type='application/pdf')
    #response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['Content-Disposition'] = f'inline; filename="{filename}"'
    return response
