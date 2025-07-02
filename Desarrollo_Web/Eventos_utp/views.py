from django.db import models # ¡Importa el módulo models de Django!
from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Colegio, Promotor
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict
import json # Necesario para parsear JSON en DELETE

# Nota: Para un entorno de producción, es mejor usar Django Rest Framework (DRF)
# para APIs RESTful. Para este ejemplo, manejaremos la lógica directamente en las vistas
# para que se ajuste a tu setup actual con un JS grande.

def layout(request):
    return render(request, 'layout.html')

def index(request):
    return render(request, 'index.html')

def promotores(request):
    return render(request, 'promotor.html')

# Vista principal para la página de Colegios (maneja GET para renderizar y POST para crear/actualizar)
# @csrf_exempt # Descomenta esta línea SOLO PARA PRUEBAS si tienes problemas con CSRF en AJAX.
# En producción, asegúrate de que tu JS envíe el token CSRF.
def colegios(request):
    if request.method == 'POST':
        # Lógica para crear o actualizar un Colegio
        try:
            # Usamos request.POST.get para los campos de texto/select
            # Y request.FILES para los archivos
            colegio_id = request.POST.get('idColegioEditar')
            
            if colegio_id:
                # Editar colegio existente
                colegio = Colegio.objects.get(pk=colegio_id)
                mensaje_exito = "Colegio actualizado con éxito."
            else:
                # Crear nuevo colegio
                colegio = Colegio()
                mensaje_exito = "Colegio registrado con éxito."

            # Obtener el promotor seleccionado
            promotor_id = request.POST.get('promotorColegio')
            try:
                promotor = Promotor.objects.get(pk=promotor_id)
            except Promotor.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Promotor no encontrado.'}, status=400)

            # Asignar los datos del formulario al modelo
            colegio.nombre = request.POST.get('nombreColegio')
            colegio.promotor = promotor
            colegio.apellidos_encargado = request.POST.get('apellidosEncargadoColegio')
            colegio.nombres_encargado = request.POST.get('nombreEncargadoColegio')
            colegio.telefono_encargado = request.POST.get('telefonoEncargadoColegio')
            colegio.distrito = request.POST.get('distritoColegio')
            colegio.link_ubicacion = request.POST.get('linkUbicacionColegio') # Puede ser None si está vacío

            # Manejar la subida de archivos
            if 'archivoBdColegio' in request.FILES:
                colegio.archivo_excel = request.FILES['archivoBdColegio']
            # Si es una edición y no se sube un nuevo archivo, mantener el existente.
            # Si es un nuevo registro y no se sube archivo, el campo blank=True/null=True lo permite.

            colegio.save()

            # Preparar los datos del colegio guardado para la respuesta JSON
            # Necesitamos incluir el nombre del promotor para la tabla en el frontend
            colegio_data = model_to_dict(colegio, exclude=['archivo_excel'])
            colegio_data['promotor_nombre_completo'] = f"{promotor.apellidos}, {promotor.nombres} ({promotor.codigo})"
            colegio_data['promotor_id'] = promotor.id # También enviamos el ID del promotor
            colegio_data['archivo_excel_url'] = colegio.archivo_excel.url if colegio.archivo_excel else None
            colegio_data['archivo_excel_name'] = colegio.archivo_excel.name if colegio.archivo_excel else None


            return JsonResponse({'success': True, 'message': mensaje_exito, 'colegio': colegio_data})

        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error al guardar el colegio: {str(e)}'}, status=500)

    else:
        # Lógica para mostrar la página de Colegios (GET request)
        promotores_list = Promotor.objects.all().order_by('apellidos', 'nombres')
        context = {
            'promotores': promotores_list,
        }
        return render(request, 'colegios.html', context)

# API para obtener la lista de colegios (con búsqueda)
def api_colegios_list(request):
    if request.method == 'GET':
        query = request.GET.get('search', '').lower()
        
        colegios_qs = Colegio.objects.all().select_related('promotor').order_by('nombre')
        
        if query:
            # Filtrar por nombre, promotor, encargado, distrito
            colegios_qs = colegios_qs.filter(
                models.Q(nombre__icontains=query) |
                models.Q(promotor__nombres__icontains=query) |
                models.Q(promotor__apellidos__icontains=query) |
                models.Q(promotor__codigo__icontains=query) |
                models.Q(nombres_encargado__icontains=query) |
                models.Q(apellidos_encargado__icontains=query) |
                models.Q(distrito__icontains=query)
            )

        colegios_data = []
        for colegio in colegios_qs:
            colegio_dict = model_to_dict(colegio, exclude=['archivo_excel'])
            # Añadir información del promotor para el frontend
            colegio_dict['promotor_nombre_completo'] = f"{colegio.promotor.apellidos}, {colegio.promotor.nombres} ({colegio.promotor.codigo})"
            colegio_dict['promotor_id'] = colegio.promotor.id # Aseguramos que el ID del promotor esté disponible
            colegio_dict['archivo_excel_url'] = colegio.archivo_excel.url if colegio.archivo_excel else None
            colegio_dict['archivo_excel_name'] = colegio.archivo_excel.name if colegio.archivo_excel else None
            colegios_data.append(colegio_dict)
        
        return JsonResponse({'success': True, 'colegios': colegios_data})
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)

# API para eliminar un colegio
# @csrf_exempt # Descomenta esta línea SOLO PARA PRUEBAS si tienes problemas con CSRF en AJAX.
# En producción, asegúrate de que tu JS envíe el token CSRF.
def api_colegios_delete(request, pk):
    if request.method == 'POST': # O DELETE si configuras tu JS para enviar DELETE
        try:
            colegio = Colegio.objects.get(pk=pk)
            colegio_nombre = colegio.nombre # Guardar el nombre antes de eliminar
            colegio.delete()
            return JsonResponse({'success': True, 'message': f'Colegio "{colegio_nombre}" eliminado con éxito.'})
        except Colegio.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Colegio no encontrado.'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error al eliminar el colegio: {str(e)}'}, status=500)
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)


def asistencia(request):
    return render(request, 'asistencia.html')

def generador(request):
    return render(request, 'generador.html')
