
import re
from ..models import Administrador
class CN_Administrador():
    @staticmethod
    def validar_registro(nombre, apellido, correo, sede):
        mensaje=''
        if not nombre or nombre.strip() == '':
            mensaje = 'El nombre no puede estar vacío'
            return mensaje
        if not apellido or apellido.strip() == '':
            mensaje = 'El apellido no puede estar vacío'
            return mensaje
        if not correo or correo.strip() == '':
            mensaje = 'El correo no puede estar vacío'
            return mensaje
        if not sede or sede.strip() == '':
            mensaje = 'La sede no puede estar vacía'
            return mensaje
        
        if len(nombre.strip()) < 2:
            return 'El nombre debe tener al menos 2 caracteres'
        if len(apellido.strip()) < 2:
            return 'El apellido debe tener al menos 2 caracteres'
        
        if not CN_Administrador.validar_correo(correo):
            mensaje = 'El correo no tiene un formato válido'
            return mensaje
        
        if Administrador.objects.filter(correo_administrador=correo).exists():
            mensaje = 'Ya existe un administrador registrado con ese correo'
            return mensaje
        
    @staticmethod
    def validar_correo(correo):
        # Expresión regular simple para correos
        patron = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return re.match(patron, correo) is not None