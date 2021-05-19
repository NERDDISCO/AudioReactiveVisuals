#pragma once

#include "../uniforms.h"
#include "../scene/model.h"

bool loadGLTF(Uniforms& _uniforms, WatchFileList& _files, Materials& _materials, Models& _models, int _index, bool _verbose);