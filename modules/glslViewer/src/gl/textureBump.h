#pragma once

#include "texture.h"

class TextureBump : public Texture {
public:
    virtual bool    load(const std::string& _filepath, bool _vFlip);
};
