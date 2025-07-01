import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def Enviar_correo(correo_destino,codigo_especial):
    try:
            asunto = "Tu nuevo codigo especial"
            nombre= "unknow"
            correo = correo_destino
            mensaje = "te mandamos tu codigo especial"
            
            # Configuración del servidor SMTP
            servidor = smtplib.SMTP("smtp.gmail.com", 587)
            servidor.starttls()
            servidor.login("anomandrus58@gmail.com", "yyrk iidi bpsr lbnu")  # Usa contraseña de aplicación segura
            #ksjv slni uuro bzdz
            # Crear el mensaje
            msg = MIMEMultipart()  # Utilizar MIMEMultipart para incluir asunto y cuerpo del correo
            msg["From"] = "anomandrus58@gmail.com"
            msg["To"] = correo
            msg["Subject"] = asunto  # Asignar el asunto correctamente

            #CONSTRUIR EL CUERO DEL MENSAJE
            cuerpo_mensaje=f"El correo es {correo} \nHola que tal, yo soy {nombre}!!!!\nMi asunto es: {asunto} \nEsta es mi situacion {mensaje} y tu codigo especial es {codigo_especial}"
            # Adjuntar el mensaje
            msg.attach(MIMEText(cuerpo_mensaje, "plain"))

            # Enviar el correo
            servidor.sendmail("anomandrus58@gmail.com", correo, msg.as_string())
            servidor.quit()

            return "Mensaje enviado con éxito"
    
    except Exception as e:
        return f"Ocurrió un error al enviar el correo: {str(e)}"