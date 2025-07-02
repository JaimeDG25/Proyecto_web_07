import re
from ..models import Apoyo,Promotor,Colegio

class CN_Promotor():
    @staticmethod
    def validar_registro(nombre,apellido,telefono,dni,correo):
        mensaje=''
        if not nombre or nombre.strip() == '':
            mensaje='El nombre no puede estar vacío'
            return mensaje
        if not apellido or apellido.strip() == '':
            mensaje = 'El apellido no puede estar vacío'
            return mensaje
        if not telefono or telefono.strip() == '':
            mensaje = 'El telefono no puede estar vacío'
        if not dni or dni.strip() == '':
            mensaje = 'El dni no puede estar vacío'   
        if not correo or correo.strip() == '':
            mensaje = 'El correo no puede estar vacío'
        if not CN_Promotor.validar_correo(correo):
            mensaje = 'El correo no tiene un formato válido'
            return mensaje
        
    @staticmethod
    def validar_correo(correo):
        patron = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return re.match(patron, correo) is not None