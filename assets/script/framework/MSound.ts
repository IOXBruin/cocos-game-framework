import { G } from "./G";
import { L } from "./L";
import { MLog } from "./MLog";

interface ISound {
    url: string,            // 声音的资源字符串
    loop?: boolean,         // 是否循环播放,是否为bgm,默认为false
    volume?: number,        // 音量,默认为1
    clip?: cc.AudioClip,    // 声音的cc.AudioClip资源,默认为null
    id?: number,            // 声音的播放id,默认为null
}
const C = {
    BASE_PATH: "sound",     // 资源路径
    DEFAULT_SWITCH: true,   // 默认声音开关
    SOUND: {                // 声音类型以及其对应的url
        "bgm-test": "test",
        "btn": "test",
    },
}

/**
 * [M] 声音管理
 * - 保存已经载入的声音,cc.AudioClip
 * - 保存已经播放的声音id
 */
export class MSound {

    /** 初始化本地存储 */
    static init_local() {
        L.sound = C.DEFAULT_SWITCH
    }

    static ins: MSound;

    /** 初始化 */
    static init() {
        G.check_ins(MSound)
        MSound.ins = new MSound()
        // 初始化声音
        MSound.ins.map_sound_ins.set("bgm-test", { url: C.SOUND["bgm-test"], loop: true })
        MSound.ins.map_sound_ins.set("btn", { url: C.SOUND["btn"] })
        // check
        if (MSound.ins.map_sound_ins.size != Object.keys(C.SOUND).length) {
            MLog.warn("@MSound: sound初始化个数异常")
        }
    }

    /** 声音的实例存储 */
    private map_sound_ins: Map<keyof typeof C.SOUND, ISound> = new Map()

    /** 获取声音开关 */
    static get_sound_switch(): boolean {
        return L.sound
    }

    /** 设置声音开关(直接反向) */
    static set_sound_switch() {
        L.sound = !L.sound
        if (L.sound) {
            cc.audioEngine.pauseAll()
        } else {
            cc.audioEngine.resumeAll()
        }
    }

    /** 播放某一个声音:play/resume */
    static async play(sound: keyof typeof C.SOUND) {
        if (!L.sound) { return }
        let info = MSound.ins.map_sound_ins.get(sound)
        // 载入audio clip资源
        if (!info.clip) {
            info.clip = await G.load_res(`${C.BASE_PATH}/${info.url}`, cc.AudioClip)
        }
        if (!info.clip) {
            MLog.error(`@MSound: audio clip no exsit, url=${info.url}`)
            return
        }
        if (info.loop) {
            // bgm类型,循环播放,只需要播放1次即可
            switch (cc.audioEngine.getState(info.id)) {
                case cc.audioEngine.AudioState.ERROR: case cc.audioEngine.AudioState.STOPPED:
                    info.id = cc.audioEngine.play(info.clip, info.loop, info.volume)
                    break;
                case cc.audioEngine.AudioState.PAUSED:
                    cc.audioEngine.resume(info.id)
                    break;
                default: case cc.audioEngine.AudioState.INITIALZING: case cc.audioEngine.AudioState.PLAYING:
                    break;
            }
        } else {
            // 普通音效类型,重复播放,相互独立
            info.id = cc.audioEngine.play(info.clip, info.loop, info.volume)
        }
    }

    /** 停止某一个声音:stop/pause */
    static stop(sound: keyof typeof C.SOUND) {
        let info = MSound.ins.map_sound_ins.get(sound)
        if (info.loop) {
            // bgm类型,pause
            cc.audioEngine.pause(info.id)
        } else {
            // 普通音效类型,stop
            cc.audioEngine.stop(info.id)
        }
    }

    // 常用声音

    static play_bgm() {
        MSound.play("bgm-test")
    }

    /** 常用的声音:按钮 */
    static play_btn() {
        MSound.play("btn")
    }

}