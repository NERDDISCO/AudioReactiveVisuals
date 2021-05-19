/*
Copyright (c) 2016, Patricio Gonzalez Vivo
All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the copyright holder nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permm_fbo_idission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

#include "fbo.h"
#include <iostream>

Fbo::Fbo():
    m_id(0), 
    m_fbo_id(0), m_old_fbo_id(0), 
    m_depth_id(0), m_depth_buffer(0),  
    m_type(COLOR_TEXTURE), m_width(0), m_height(0), 
    m_allocated(false), m_binded(false), m_depth(false) {
}

Fbo::~Fbo() {
    unbind();
    if (m_allocated) {
        glDeleteTextures(1, &m_id);
        glDeleteRenderbuffers(1, &m_depth_buffer);
        glDeleteFramebuffers(1, &m_fbo_id);
        m_allocated = false;
    }
}


void Fbo::allocate(const uint32_t _width, const uint32_t _height, FboType _type) {
    m_type = _type;

    bool color_texture = true;
    bool depth_texture = false;

    switch(_type) {
        case COLOR_TEXTURE:
            m_depth = false;
            color_texture = true;
            depth_texture = false;
        break;
        case COLOR_TEXTURE_DEPTH_BUFFER:
            m_depth = true;
            color_texture = true;
            depth_texture = false;
        break;
        case COLOR_DEPTH_TEXTURES:
            m_depth = true;
            color_texture = true;
            depth_texture = true;
        break;
        case DEPTH_TEXTURE:
            m_depth = true;
            color_texture = false;
            depth_texture = true;
        break;
    }

    if (!m_allocated) {
        // Create a frame buffer
        glGenFramebuffers(1, &m_fbo_id);

        // Create a texture to hold the depth buffer
        if (m_depth) 
            glGenRenderbuffers(1, &m_depth_buffer);
    }

    m_width = _width;
    m_height = _height;

    bind();

    if (color_texture) {

        // Generate a texture to hold the colour buffer
        if (m_id == 0) 
            glGenTextures(1, &m_id);

        // Color
        glBindTexture(GL_TEXTURE_2D, m_id);

#ifdef PLATFORM_RPI
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, m_width, m_height, 0, GL_RGBA, GL_UNSIGNED_BYTE, NULL);
#else
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16, m_width, m_height, 0, GL_RGBA, GL_UNSIGNED_BYTE, NULL);
#endif

        // glGenerateMipmap(GL_TEXTURE_2D);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        // glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, m_id, 0);
    }

    // Depth Buffer
    if (m_depth) {
        glBindRenderbuffer(GL_RENDERBUFFER, m_depth_buffer);

#ifdef PLATFORM_RPI
        glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, m_width, m_height);
#else
        glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT, m_width, m_height);
#endif
        glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, m_depth_buffer);
    

        if (depth_texture) {

            // Generate a texture to hold the depth buffer
            if (m_depth_id == 0)
                glGenTextures(1, &m_depth_id);

            glBindTexture(GL_TEXTURE_2D, m_depth_id);
#ifdef PLATFORM_RPI
            glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT16, m_width, m_height, 0, GL_DEPTH_COMPONENT, GL_FLOAT, NULL);
            // glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT16, m_width, m_height, 0, GL_DEPTH_COMPONENT, GL_UNSIGNED_INT, NULL);
            // glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT16, m_width, m_height, 0, GL_DEPTH_COMPONENT, GL_UNSIGNED_SHORT, NULL);
#else
            glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT32F, m_width, m_height, 0, GL_DEPTH_COMPONENT, GL_UNSIGNED_INT, NULL);
#endif

            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
            glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, m_depth_id, 0);
        }
    }

    GLenum result = glCheckFramebufferStatus(GL_FRAMEBUFFER);
    if (result == GL_FRAMEBUFFER_COMPLETE) {
        m_allocated = true;
    }
    else {
        std::cout << "FBO: not complete " << result << std::endl;
    }
    unbind();

    glBindTexture(GL_TEXTURE_2D, 0);

    if (m_depth)
        glBindRenderbuffer(GL_RENDERBUFFER, 0);
}

void Fbo::bind() {
    if (!m_binded) {
        glGetIntegerv(GL_FRAMEBUFFER_BINDING, (GLint *)&m_old_fbo_id);

        glBindTexture(GL_TEXTURE_2D, 0);
        glEnable(GL_TEXTURE_2D);
        glBindFramebuffer(GL_FRAMEBUFFER, m_fbo_id);
        glViewport(0.0f, 0.0f, m_width, m_height);
        glClearColor(0.0f, 0.0f, 0.0f, 1.0f);

        if (m_depth)
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        else
            glClear(GL_COLOR_BUFFER_BIT);

        m_binded = true;
    }
}

void Fbo::unbind() {
    if (m_binded) {
        glBindFramebuffer(GL_FRAMEBUFFER, m_old_fbo_id);
        m_binded = false;
    }
}
