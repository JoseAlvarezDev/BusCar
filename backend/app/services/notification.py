"""
BusCar Notification Service - Email notifications for price alerts
"""
from typing import List, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from app.config import settings
from app.models import Car, Alert


class NotificationService:
    """Service for sending email notifications"""
    
    def __init__(self):
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_user = settings.smtp_user
        self.smtp_password = settings.smtp_password
        self.from_email = settings.smtp_from
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send an email"""
        if not self.smtp_user or not self.smtp_password:
            print("SMTP not configured, skipping email")
            return False
        
        try:
            message = MIMEMultipart("alternative")
            message["From"] = self.from_email
            message["To"] = to_email
            message["Subject"] = subject
            
            # Add text and HTML parts
            if text_content:
                message.attach(MIMEText(text_content, "plain"))
            message.attach(MIMEText(html_content, "html"))
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=True
            )
            
            return True
            
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    async def send_alert_notification(
        self,
        alert: Alert,
        matching_cars: List[Car]
    ) -> bool:
        """Send notification for a price alert with matching cars"""
        if not matching_cars:
            return False
        
        # Build email content
        subject = f"🚗 BusCar: {len(matching_cars)} coches encontrados para tu alerta"
        
        # Build HTML email
        cars_html = ""
        for car in matching_cars[:10]:  # Limit to 10 cars per email
            cars_html += f"""
            <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; gap: 16px;">
                    <img src="{car.image_url or 'https://via.placeholder.com/150x100'}" 
                         alt="{car.brand} {car.model}" 
                         style="width: 150px; height: 100px; object-fit: cover; border-radius: 4px;">
                    <div>
                        <h3 style="margin: 0 0 8px 0; color: #333;">{car.brand} {car.model}</h3>
                        <p style="margin: 0 0 4px 0; font-size: 24px; font-weight: bold; color: #6366f1;">
                            {car.price:,.0f}€
                        </p>
                        <p style="margin: 0; color: #666; font-size: 14px;">
                            {car.year} · {car.km:,} km · {car.fuel.capitalize()} · {car.location}
                        </p>
                        <a href="{car.url}" 
                           style="display: inline-block; margin-top: 8px; padding: 8px 16px; 
                                  background: #6366f1; color: white; text-decoration: none; 
                                  border-radius: 4px; font-size: 14px;">
                            Ver anuncio →
                        </a>
                    </div>
                </div>
            </div>
            """
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                     background: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; 
                        overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 24px; 
                            text-align: center;">
                    <h1 style="margin: 0; color: white; font-size: 28px;">🚗 BusCar</h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9);">
                        Alerta de precio activa
                    </p>
                </div>
                
                <!-- Content -->
                <div style="padding: 24px;">
                    <h2 style="margin: 0 0 16px 0; color: #333;">
                        ¡Hemos encontrado {len(matching_cars)} coches para ti!
                    </h2>
                    
                    <p style="color: #666; margin-bottom: 8px;">
                        <strong>Tu búsqueda:</strong> 
                        {alert.brand or 'Cualquier marca'} 
                        {alert.model or ''} 
                        - Máximo {alert.max_price:,.0f}€
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    
                    {cars_html}
                    
                    {f'<p style="text-align: center; color: #666;">Y {len(matching_cars) - 10} coches más...</p>' if len(matching_cars) > 10 else ''}
                    
                    <div style="text-align: center; margin-top: 24px;">
                        <a href="http://localhost:8080" 
                           style="display: inline-block; padding: 12px 24px; background: #6366f1; 
                                  color: white; text-decoration: none; border-radius: 8px; 
                                  font-weight: 600;">
                            Ver todos en BusCar
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #999;">
                    <p style="margin: 0;">
                        Has recibido este email porque tienes una alerta activa en BusCar.<br>
                        <a href="#" style="color: #6366f1;">Gestionar alertas</a> · 
                        <a href="#" style="color: #6366f1;">Cancelar suscripción</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        BusCar - Alerta de precio
        
        ¡Hemos encontrado {len(matching_cars)} coches para tu búsqueda!
        
        Búsqueda: {alert.brand or 'Cualquier marca'} {alert.model or ''} - Máximo {alert.max_price:,.0f}€
        
        Visita BusCar para ver los resultados: http://localhost:8080
        """
        
        return await self.send_email(
            to_email=alert.email,
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )


# Singleton instance
notification_service = NotificationService()
