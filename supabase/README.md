# Base de datos (Supabase)

Todo el esquema está en `migrations/20261006000000_esquema_inicial.sql`. Es
idempotente: se puede volver a ejecutar sin borrar datos.

## Puesta en marcha

1. **Crear un proyecto nuevo** en <https://supabase.com/dashboard> (no reutilizar
   el de otra boda). Región sugerida: la más cercana a Guatemala (`us-east-1`).
   Guardar la contraseña de la base en un gestor de contraseñas.
2. **Aplicar el esquema**, con una de estas dos opciones:
   - *SQL Editor*: pegar el archivo de la migración completo y ejecutar.
   - *CLI*: `npx supabase login`, `npx supabase link --project-ref <ref>` y
     `npx supabase db push`.
3. **Crear el usuario de los novios**: Authentication → Users → *Add user* →
   *Create new user* (correo + contraseña larga, marcar *Auto Confirm User*).
4. **Darle permiso de admin** desde el SQL Editor:
   ```sql
   insert into public.admins (email) values ('correo-de-los-novios@ejemplo.com');
   ```
5. **Cerrar el registro público**: Authentication → Sign In / Providers → Email →
   desactivar *Allow new users to sign up*.
6. **Conectar la app**: Project Settings → API. Copiar *Project URL* y la clave
   *anon / publishable* en `.env` (local) y en las variables del hosting:
   ```
   VITE_SUPABASE_URL=https://<ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
   Nunca usar la clave *service_role* en la app: salta todas las reglas.

## Qué protege

| Quién | Qué puede hacer |
|---|---|
| Invitado (sin cuenta) | Solo `login_guest` y `submit_rsvp` con **su** contraseña. Recibe su nombre, máximo y respuesta; nunca notas, teléfono ni mesa. No lee ni escribe ninguna tabla. |
| Alguien probando contraseñas | Tras **10 fallos en 15 minutos**, esa conexión queda bloqueada 15 minutos (también para confirmar). |
| Cuenta de Supabase que no está en `admins` | Nada: no ve invitados ni mesas, y no puede darse permisos. |
| Novios (email en `admins`) | Todo sobre invitados y mesas. No ven `admins` ni las tablas privadas desde la app. |

Reglas que valida la propia base, aunque alguien salte la app:

- Contraseña de invitado única, de 6 a 64 caracteres, sin espacios al borde.
- Máximo de personas entre 1 y 20; nunca más confirmados que el máximo.
- Si un invitado pasa a "no asistirá" o "pendiente", se liberan su mesa y sus sillas.
- Mesas de 2 a 30 sillas; textos con largo máximo.

Privado (esquema `private`, fuera de la API): `login_attempts` (intentos
fallidos por conexión, se limpian solos tras un día) y `rsvp_log` (cada
respuesta de cada invitado, con fecha). Se consultan desde el SQL Editor:

```sql
select * from private.rsvp_log order by at desc;
```

## Pruebas

```bash
npm run test:db
```

Corre la migración (dos veces, para comprobar que es idempotente) en un
Postgres real en memoria (PGlite) y verifica 39 reglas de funcionalidad y
seguridad con los roles de Supabase simulados.

## Recomendaciones de la cuenta

- Activar la verificación en dos pasos (MFA) en la cuenta de Supabase.
- Usar contraseñas de invitado no adivinables (ej. `garcia-7k2m`, no `boda-001`).
- Las contraseñas de invitado se guardan legibles a propósito: los novios las
  ven y las copian en el mensaje. Solo los admins pueden leerlas.
