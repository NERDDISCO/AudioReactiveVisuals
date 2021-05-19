
// Default for RASPBERRYPI < 4
#ifdef PLATFORM_RPI             // RASPBERRY PI

#include "bcm_host.h"
#undef countof

#ifdef DRIVER_FAKE_KMS
#include <xf86drm.h>
#include <xf86drmMode.h>
#include <gbm.h>
#endif

#ifdef DRIVER_GLFW
#define GLFW_INCLUDE_GLEXT
#define GLFW_EXPOSE_NATIVE_EGL
#define GL_GLEXT_PROTOTYPES
#define GLFW_INCLUDE_ES2
#define GLFW_INCLUDE_GLCOREARB
#include <GLFW/glfw3.h>
#include <GLFW/glfw3native.h>
#include <EGL/eglext.h>

#else
#include <EGL/egl.h>
#include <EGL/eglext.h>
#include <GLES2/gl2.h>
#include <GLES2/gl2ext.h>
#endif

EGLImageKHR createImage(EGLDisplay dpy, EGLContext ctx, EGLenum target, EGLClientBuffer buffer, const EGLint *attrib_list);
EGLBoolean destroyImage(EGLDisplay dpy, EGLImageKHR image);
void imageTargetTexture2D(EGLenum target, EGLImageKHR image);

// MACOS
#elif defined(PLATFORM_OSX)          // MACOS 
#define GL_PROGRAM_BINARY_LENGTH 0x8741
#include <GLFW/glfw3.h>
#include <OpenGL/gl.h>
#include <OpenGL/glext.h>


#elif defined(_WIN32)               // WINDOWS
#include <GL/glew.h>

#else                               // ANY LINUX using GLFW
#define GL_GLEXT_PROTOTYPES
#include <GLFW/glfw3.h>

#endif
