# Carvajal AutoTech - React App

Aplicación React convertida desde Flutter con **Supabase como backend completo**.

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration (REQUERIDO)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE

# App Configuration (opcional)
REACT_APP_APP_NAME=Carvajal AutoTech
REACT_APP_VERSION=1.0.0
```

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Configuración de Supabase

1. **Crear esquema de base de datos**: 
   - Ejecuta `supabase/migrations/001_create_profiles.sql`
   - Ejecuta `supabase/migrations/002_create_quiz_schema.sql`

2. **Configurar autenticación**: 
   - Habilitar email/password en Supabase Auth
   - Configurar templates de email si es necesario

3. **Desplegar funciones**: 
   - Sube `supabase/functions/auto-grade-quiz/` a tu proyecto
   
4. **RLS**: Las políticas de Row Level Security ya están incluidas

### 4. Ejecutar la Aplicación

```bash
npm start
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── CustomTextField.tsx
│   ├── CustomButton.tsx
│   ├── NotificationProvider.tsx
│   └── auth/           # Pantallas de autenticación
├── config/             # Configuración
│   └── supabase.ts    # Cliente de Supabase
├── hooks/              # Custom hooks
│   └── useAuth.ts     # Hook de autenticación
├── services/           # Servicios
│   ├── AuthService.ts # Servicio de autenticación
│   └── QuizService.ts # Servicio de cuestionarios
└── App.tsx            # Componente principal
```

## 🔐 Autenticación

### Flujo de Autenticación

1. **Login**: `AuthService.signInWithEmailPassword()`
2. **Registro**: `AuthService.signUpStudent()`
3. **Logout**: `AuthService.signOut()`
4. **Estado**: `useAuth()` hook

### Roles de Usuario

- **student**: Usuario estudiante con acceso a cuestionarios
- **admin**: Administrador con acceso al panel de control

## 🎨 Componentes Personalizados

### CustomTextField

```tsx
<CustomTextField
  label="Email"
  hint="correo@ejemplo.com"
  value={email}
  onChange={setEmail}
  prefixIcon="email_outlined"
  keyboardType="email"
  validator={validateEmail}
/>
```

### CustomButton

```tsx
<CustomButton
  text="Iniciar Sesión"
  onClick={handleLogin}
  isLoading={loading}
  gradient={['#3b82f6', '#2563eb']}
  icon="login"
/>
```

### Notificaciones

```tsx
const { showNotification } = useNotification();

showNotification({
  type: 'success',
  title: '¡Éxito!',
  message: 'Operación completada',
});
```

## 🔧 Configuración de Supabase

### Tabla profiles

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'student',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Políticas RLS

- **SELECT**: Público (todos pueden ver perfiles)
- **INSERT**: Solo el propio usuario
- **UPDATE**: Solo el propio usuario

## 🚀 Despliegue

### Variables de Entorno para Producción

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=https://api.example.com
```

### Build

```bash
npm run build
```

## 🔧 Desarrollo

### Scripts Disponibles

- `npm start`: Servidor de desarrollo
- `npm run build`: Build para producción
- `npm test`: Ejecutar tests
- `npm run eject`: Exponer configuración

### Estructura de Auth

1. **AuthService**: Servicio principal de autenticación
2. **useAuth**: Hook para componentes React
3. **NotificationProvider**: Sistema de notificaciones
4. **ProtectedRoute**: Componente para rutas protegidas

## 📱 Características

- ✅ **Autenticación completa** con Supabase
- ✅ **Roles de usuario** (student/admin)
- ✅ **Persistencia de sesión**
- ✅ **Validación de formularios**
- ✅ **Animaciones fluidas**
- ✅ **Responsive design**
- ✅ **Sistema de notificaciones**
- ✅ **Integración con backend personalizado**

## 📊 Funcionalidades de Cuestionarios

### Gestión Completa en Supabase:
- **Categorías**: Organización de cuestionarios
- **Cuestionarios**: Creación, edición y publicación
- **Preguntas**: Múltiple opción, verdadero/falso, respuesta corta, ensayo
- **Intentos**: Seguimiento de progreso y resultados
- **Calificación automática**: Para preguntas de opción múltiple
- **Estadísticas**: Análisis de rendimiento

## 🐛 Troubleshooting

### Error de Supabase
- Verifica las variables de entorno
- Asegúrate de que el proyecto de Supabase esté activo
- Confirma que las migraciones se ejecutaron correctamente

### Error de RLS
- Revisa que las políticas de Row Level Security estén configuradas
- Verifica que el usuario esté autenticado correctamente

### Error de funciones
- Asegúrate de que las funciones de Supabase estén desplegadas
- Verifica los logs en el dashboard de Supabase

## 📞 Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.
