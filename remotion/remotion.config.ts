import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// h264 + mp4 is the safest target for YouTube uploads.
Config.setCodec('h264');
