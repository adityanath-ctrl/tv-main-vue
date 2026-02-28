
/**
 * The class to instantiate Radiant Media Player
 * @export
 * @class RadiantMP
*/
declare class RadiantMP {
    /**
     * @constructor
     * @param {string}  id - the id for the player container. This is a required parameter.
     */
    constructor(id: string);
    rmpUtils: Utils;
    rmpReadyManagement: ReadyManagement;
    rmpSizeManagement: SizeManagement;
    dom: {};
    id: string;
    rmpEventsManagement: EventsManagement;
    rmpDomManagement: DomManagement;
    rmpPlaybackManagement: PlaybackManagement;
    rmpInitManagement: InitManagement;
    rmpUIManagement: UIManagement;
    rmpModuleManagement: ModuleManagement;
    rmpLogsManagement: LogsManagement;
    rmpAccessible: Accessible;
    rmpColorsManagement: ColorsManagement;
    rmpLicense: License;
    rmpVolumeManagement: VolumeManagement;
    rmpFullscreenManagement: FullscreenManagement;
    rmpSeekManagement: SeekManagement;
    rmpPosterManagement: PosterManagement;
    rmpLogo: Logo;
    rmpAdsHelpers: AdsHelpers;
    isMobile: boolean;
    fullscreenResolve: (value: any) => void;
    fullscreenReject: (reason?: any) => void;
    initResolve: (value: any) => void;
    initReject: (reason?: any) => void;
    playResolve: (value: any) => void;
    playReject: (reason?: any) => void;
    setSrcResolve: (value: any) => void;
    setSrcReject: (reason?: any) => void;
    destroyResolve: (value: any) => void;
    destroyReject: (reason?: any) => void;
    resolvePromise(type: string): void;
    rejectPromise(type: string): void;
    dispatch(eventName: string, data: object): void;
    on(eventName: string, callback: Function): void;
    one(eventName: string, callback: Function): void;
    off(eventName: string, callback: Function): void;
    okHlsJS: boolean;
    okShaka: boolean;
    usingNativeHlsOnAppleDevices: boolean;
    preload: string;
    forceMseHlsOnAppleDevices: boolean;
    rmpGoogleCast: GoogleCast | GoogleCastCordova;
    rmpMux: Mux;
    /**
     * @typedef {object} FlipVideo
     * @property {number} [x]
     * @property {number} [y]
     * @property {number} [z]
     * @typedef {object} CustomTrackNames
     * @property {string} [captions]
     * @property {string} [quality]
     * @property {string} [audio]
     * @typedef {object} CustomModule
     * @property {string} hint
     * @property {string} svg
     * @property {string} svgHover
     * @property {function} callback
     * @typedef {object} TextTrack
     * @property {string} lng
     * @property {string} name
     * @property {string} uri
     * @property {boolean} default
     * @typedef {object} TranscriptTrack
     * @property {string} lng
     * @property {string} name
     * @property {string} uri
     * @typedef {object} AdSchedule
     * @property {string} [preroll]
     * @property {string[][]} [midroll]
     * @property {string} [postroll]
     * @typedef {object} CuePoint
     * @property {number} time
     * @property {string} text
     * @typedef {object} AdsLabels
     * @property {string} [controlBarCustomMessage]
     * @property {string} [skipMessage]
     * @property {string} [textForClickUIOnMobile]
     * @typedef {object} ErrorLabels
     * @property {string} [customErrorMessage]
     * @property {string} [noSupportMessage]
     * @property {string} [noSupportInstallChrome]
     * @typedef {object} FccCaptionsLabels
     * @property {string} [fontColor]
     * @property {string} [fontOpacity]
     * @property {string} [fontSize]
     * @property {string} [fontFamily]
     * @property {string} [fontEdge]
     * @property {string} [backgroundColor]
     * @property {string} [backgroundOpacity]
     * @property {string} [windowColor]
     * @property {string} [windowOpacity]
     * @typedef {object} HintLabels
     * @property {string} [play]
     * @property {string} [pause]
     * @property {string} [seek]
     * @property {string} [enterFullscreen]
     * @property {string} [exitFullscreen]
     * @property {string} [quickRewind]
     * @property {string} [quickForward]
     * @property {string} [sharing]
     * @property {string} [sharingLink]
     * @property {string} [sharingEmbedCode]
     * @property {string} [quality]
     * @property {string} [volume]
     * @property {string} [mute]
     * @property {string} [unmute]
     * @property {string} [minus]
     * @property {string} [plus]
     * @property {string} [speed]
     * @property {string} [captions]
     * @property {string} [track]
     * @property {string} [transcript]
     * @property {string} [audio]
     * @property {string} [chapters]
     * @property {string} [live]
     * @property {string} [pip]
     * @property {string} [close]
     * @property {string} [settings]
     * @property {string} [back]
     * @property {string} [cast]
     * @property {string} [airplay]
     * @property {string} [playlist]
     * @property {string} [next]
     * @property {string} [previous]
     * @property {string} [related]
     * @property {string} [upNext]
     * @property {string} [up]
     * @property {string} [down]
     * @property {string} [left]
     * @property {string} [right]
     * @property {string} [default]
     * @property {string} [off]
     * @property {string} [loop]
     * @property {string} [info]
     * @typedef {object} Labels
     * @property {HintLabels} [hint]
     * @property {FccCaptionsLabels} [fccCaptions]
     * @property {ErrorLabels} [error]
     * @property {AdsLabels} [ads]
     * @typedef {object} Src
     * @property {string} [hls]
     * @property {string} [dash]
     * @property {string[]} [mp4]
     * @property {string[]} [webm]
     * @property {string} [fps]
     * @property {string} [m4a]
     * @property {string} [mp3]
     * @property {string} [ogg]
     * @typedef {object} FpsDrm
     * @property {string} certificatePath
     * @property {string} processSpcPath
     * @property {string} [licenseResponseType]
     * @property {object[]} [licenseRequestHeaders]
     * @property {object[]} [certificateRequestHeaders]
     * @property {function} [extractContentId]
     * @property {function} [licenseRequestMessage]
     * @property {function} [licenseRequestLoaded]
     * @property {string} [keySystem]
     * @typedef {object} ShakaDrm
     * @property {object} servers
     * @property {object} [clearKeys]
     * @property {object} [advanced]
     * @property {string} [minHdcpVersion]
     * @typedef {object} ShakaRestrictions
     * @property {number} [minWidth]
     * @property {number} [maxWidth]
     * @property {number} [minHeight]
     * @property {number} [maxHeight]
     * @property {number} [minPixels]
     * @property {number} [maxPixels]
     * @property {number} [minAudioBandwidth]
     * @property {number} [maxAudioBandwidth]
     * @property {number} [minVideoBandwidth]
     * @property {number} [maxVideoBandwidth]
     * @typedef {object} RetryParametersData
     * @property {number} [timeout]
     * @property {number} [maxAttempts]
     * @property {number} [delay]
     * @typedef {object} RetryParameters
     * @property {RetryParametersData} [manifest]
     * @property {RetryParametersData} [levels]
     * @property {RetryParametersData} [segment]
     * @property {RetryParametersData} [drm]
     * @typedef {object} Artwork
     * @property {string} src
     * @property {string} sizes
     * @property {string} type
     * @typedef {object} VideoPreference
     * @property {string} [label]
     * @property {string[]} [videoCodecs]
     * @property {string[]} [videoHdr]
     * @typedef {object} AudioPreference
     * @property {string} [lang]
     * @property {string} [label]
     * @property {string[]} [audioCodecs]
     * @property {boolean} [spatialAudio]
     * @typedef {object} SubtitlePreference
     * @property {string} [lang]
     * @property {string} [role]
     * @property {string[]} [textFormats]
     * @typedef {object} ContentMetadata
     * @property {string} [title]
     * @property {string} [description]
     * @property {string} [artist]
     * @property {string} [album]
     * @property {string} [id]
     * @property {string} [releaseDate]
     * @property {string} [thumbnail]
     * @property {string} [duration]
     * @property {string} [googleCastType]
     * @property {Artwork[]} [artwork]
     * @property {string[]} [poster]
     * @property {string[]} [endOfVideoPoster]
     * @property {string} [animatedPoster]
     * @typedef {object} RadiantMediaPlayerSettings
     * @property {string} licenseKey
     * @property {number} [width]
     * @property {number} [height]
     * @property {boolean} [iframeMode]
     * @property {boolean} [iframeAllowed]
     * @property {boolean} [autoHeightMode]
     * @property {number} [autoHeightModeRatio]
     * @property {string} [backgroundColor]
     * @property {string} [skin]
     * @property {string} [iconsSet]
     * @property {number} [iconsSize]
     * @property {string} [customIconsLoc]
     * @property {string} [iconSpinner]
     * @property {boolean} [fullWindowSkin]
     * @property {string} [skinBackgroundColor]
     * @property {string} [skinButtonColor]
     * @property {string} [skinAccentColor]
     * @property {boolean} [hideControls]
     * @property {boolean} [hideCentralPlayButton]
     * @property {boolean} [hideCentralBuffering]
     * @property {boolean} [hideSeekBar]
     * @property {boolean} [hideFullscreen]
     * @property {boolean} [hideVolume]
     * @property {boolean} [hideExternalPlayerLabels]
     * @property {boolean} [disableKeyboardControl]
     * @property {boolean} [longFormContent]
     * @property {boolean} [automaticFullscreenOnLandscape]
     * @property {boolean} [automaticLandscapeOnFullScreen]
     * @property {boolean} [fullscreenFullWindowMode]
     * @property {string} [fixedLabelsLanguage]
     * @property {boolean} [doubleClickForFullscreen]
     * @property {boolean} [pauseContentWhenViewingAreaIsClicked]
     * @property {boolean} [autoplay]
     * @property {number} [autoplayCount]
     * @property {boolean} [requestAutoplayCapabilitiesData]
     * @property {number} [detectAutoplayTimeout]
     * @property {boolean} [viewableAutoplay]
     * @property {boolean} [viewablePlayPause]
     * @property {number} [viewableThreshold]
     * @property {boolean} [srcChangeAutoplay]
     * @property {string} [posterScaleMode]
     * @property {boolean} [autoplayAnimatedPoster]
     * @property {boolean} [hideInitialBlackFrameWhenNoPoster]
     * @property {string} [scaleMode]
     * @property {boolean} [loop]
     * @property {boolean} [muted]
     * @property {boolean} [permanentMuted]
     * @property {number} [initialVolume]
     * @property {boolean} [forceInitialVolume]
     * @property {boolean} [rememberVolume]
     * @property {boolean} [rememberCurrentTime]
     * @property {boolean} [rememberQuality]
     * @property {string} [bitrateDataDisplayed]
     * @property {boolean} [displayCodecData]
     * @property {string} [preload]
     * @property {number} [delayToFade]
     * @property {ContentMetadata} [contentMetadata]
     * @property {string} [appName]
     * @property {string} [logo]
     * @property {string} [logoLoc]
     * @property {boolean} [logoWatermark]
     * @property {string} [logoPosition]
     * @property {string} [logoMargin]
     * @property {boolean} [pauseContentOnLogoClick]
     * @property {boolean} [sharing]
     * @property {string} [sharingUrl]
     * @property {string} [sharingCode]
     * @property {string[]} [sharingNetworks]
     * @property {number} [frameRate]
     * @property {boolean} [strictGdprCompliance]
     * @property {boolean} [displayRemainingTimeInPlaceOfDuration]
     * @property {boolean} [errorOnlyShowCustomText]
     * @property {CustomTrackNames} [customTrackNames]
     * @property {FlipVideo} [flipVideo]
     * @property {boolean} [audioOnly]
     * @property {boolean} [audioOnlyUseVideoLayout]
     * @property {boolean} [audioOnlyIcecast]
     * @property {boolean} [audioOnlyID3UI]
     * @property {number} [debugLevel]
     * @property {number} [debugForceRawConsoleLogs]
     * @property {string} [pathToRmpFiles]
     * @property {number} [offsetStartPosition]
     * @property {number} [quickRewind]
     * @property {number} [quickForward]
     * @property {boolean} [ajaxWithCredentials]
     * @property {boolean} [allowLocalStorage]
     * @property {boolean} [pip]
     * @property {boolean} [floating]
     * @property {number} [floatingThreshold]
     * @property {RetryParameters} [retryParameters]
     * @property {boolean} [dashFirst]
     * @property {ShakaRestrictions} [shakaRestrictions]
     * @property {ShakaDrm} [shakaDrm]
     * @property {object} [shakaRequestConfiguration]
     * @property {object} [shakaCustomConfig]
     * @property {object} [shakaFullCustomConfig]
     * @property {function|null} [shakaCustomRequestFilter]
     * @property {function|null} [shakaCustomResponseFilter]
     * @property {function|null} [shakaDrmFairPlayInitDataTransform]
     * @property {boolean} [shakaDrmEmeFairPlay]
     * @property {object} [shakaKeySystemsByURI]
     * @property {boolean} [shakaOffline]
     * @property {number} [shakaOfflinePreferredTrackQuality]
     * @property {number} [shakaMaxBufferAhead]
     * @property {number} [shakaMaxBufferBehind]
     * @property {boolean} [shakaClearBufferSwitch]
     * @property {boolean} [shakaLiveSync]
     * @property {boolean} [shakaAWSMediaTailor]
     * @property {object} [shakaAWSMediaTailorAdsParam]
     * @property {boolean} [ignoreHardwareResolution]
     * @property {boolean} [disableVideo]
     * @property {boolean} [disableAudio]
     * @property {boolean} [disableText]
     * @property {boolean} [disableIFrames]
     * @property {boolean} [disableThumbnails]
     * @property {boolean} [hlsJSFetchXhrWithCredentials]
     * @property {boolean} [autoBumpCaptionsOnVisibleControlBar]
     * @property {string} [hlsJSCaptionsTextTrack1Label]
     * @property {string} [hlsJSCaptionsTextTrack2Label]
     * @property {string} [hlsJSCaptionsTextTrack3Label]
     * @property {string} [hlsJSCaptionsTextTrack4Label]
     * @property {boolean} [hlsJSAppleAppStoreCompliance]
     * @property {boolean} [hlsJSStopDownloadWhilePaused]
     * @property {object} [hlsJSCustomConfig]
     * @property {object} [hlsJSFullCustomConfig]
     * @property {boolean} [forceNativeHlsOverHlsJS]
     * @property {boolean} [interstitialShowAdUI]
     * @property {boolean} [forceHlsJSOnAppleDevices]
     * @property {boolean} [forceMseHlsOnAppleDevices]
     * @property {boolean} [hlsJSProgressive]
     * @property {number} [hlsJSMaxBufferAhead]
     * @property {number} [hlsJSMaxBufferBehind]
     * @property {string} [manualSwitchingMode]
     * @property {boolean} [consumeLessEnergy]
     * @property {string} [hlsEngine]
     * @property {boolean} [capLevelToPlayerSize]
     * @property {boolean} [ignoreDevicePixelRatio]
     * @property {boolean} [lowLatencyMode]
     * @property {string[]} [preferredKeySystems]
     * @property {VideoPreference} [videoPreference]
     * @property {AudioPreference} [audioPreference]
     * @property {SubtitlePreference} [subtitlePreference]
     * @property {boolean} [enableCMCD]
     * @property {boolean} [useHeadersForCMCD]
     * @property {string} [cmcdSessionId]
     * @property {string} [cmcdContentId]
     * @property {number} [cmcdVersion]
     * @property {string[]} [cmcdIncludeKeys]
     * @property {boolean} [enableCMSD]
     * @property {FpsDrm} [fpsDrm]
     * @property {Src} src
     * @property {number} [initialQuality]
     * @property {boolean} [pdCheckCodecsDone]
     * @property {Labels} [labels]
     * @property {number} [dvrUIThreshold]
     * @property {TextTrack[]} [ccFiles]
     * @property {string} [crossorigin]
     * @property {string} [ccFontColor]
     * @property {number} [ccFontOpacity]
     * @property {number} [ccFontSize]
     * @property {string} [ccFontFamily]
     * @property {string} [ccFontEdge]
     * @property {string} [ccBackgroundColor]
     * @property {number} [ccBackgroundOpacity]
     * @property {string} [ccWindowColor]
     * @property {number} [ccWindowOpacity]
     * @property {TranscriptTrack[]} [transcripts]
     * @property {boolean} [enableGAVideoTracking]
     * @property {object} [gaEventParameters]
     * @property {string[]} [gaEvents]
     * @property {boolean} [enableMatomoTracking]
     * @property {string} [dataMatomoTitle]
     * @property {string} [seekBarThumbnailsLoc]
     * @property {string} [chaptersLoc]
     * @property {CuePoint[]} [cuePoints]
     * @property {boolean} [cuePointsVisibleOnTimeline]
     * @property {function|null} [cuePointsCallback]
     * @property {boolean} [speed]
     * @property {number[]} [speedRates]
     * @property {boolean} [googleCast]
     * @property {boolean} [googleCastCordova]
     * @property {boolean} [googleCastCordovaDebug]
     * @property {string} [googleCastReceiverAppId]
     * @property {boolean} [googleCastAndroidReceiverCompatible]
     * @property {string} [googleCastVmapAdsRequest]
     * @property {string} [googleCastAdTagUrl]
     * @property {object} [googleCastHeaders]
     * @property {boolean} [googleCastDrmToday]
     * @property {boolean} [googleCastEnableUITextDisplayer]
     * @property {object} [googleCastData]
     * @property {boolean} [googleCastDisableAds]
     * @property {boolean} [googleCastAllowSenderVolumeManagement]
     * @property {boolean} [airplay]
     * @property {boolean} [airplayWithMms]
     * @property {boolean} [ads]
     * @property {string} [adTagUrl]
     * @property {boolean} [adShowMarkers]
     * @property {boolean} [adOnAdBlockPreventPlayback]
     * @property {string} [adsResponse]
     * @property {boolean} [adImaTest]
     * @property {string[]} [adTagWaterfall]
     * @property {string} [adLocale]
     * @property {boolean} [adUseStyledNonLinearAds]
     * @property {AdSchedule} [adSchedule]
     * @property {string[]} [adScheduleWaterfall]
     * @property {function|null} [adScheduleCallback]
     * @property {boolean} [adScheduleReloadOnEnded]
     * @property {string} [adVpaidMode]
     * @property {boolean} [adVpaidControls]
     * @property {number} [adContentDuration]
     * @property {string} [adContentKeywords]
     * @property {string} [adContentTitle]
     * @property {boolean} [adForceNonLinearFullSlot]
     * @property {boolean} [adTagReloadOnEnded]
     * @property {boolean} [adShowRemainingTime]
     * @property {boolean} [adAutoAlign]
     * @property {boolean} [adEnablePreloading]
     * @property {boolean} [adCookiesEnabled]
     * @property {number} [adLiveStreamPrefetchSeconds]
     * @property {string} [adContinuousPlayback]
     * @property {boolean} [adForceNativeFullscreenOnIosForAds]
     * @property {number} [adNonLinearAdSlotWidth]
     * @property {number} [adNonLinearAdSlotHeight]
     * @property {string} [adCompanionBackfillMode]
     * @property {string} [adPpid]
     * @property {string} [adSessionId]
     * @property {object} [omidAccessModeRules]
     * @property {boolean} [adImaDai]
     * @property {string} [adImaDaiVodContentSourceId]
     * @property {string} [adImaDaiVodVideoId]
     * @property {boolean} [adImaDaiVodPod]
     * @property {function|null} [adImaDaiVodPodRequestStreamURLCallback]
     * @property {string} [adImaDaiLiveAssetKey]
     * @property {string} [adImaDaiPodNetworkCode]
     * @property {string} [adImaDaiCustomAssetKey]
     * @property {string} [adImaDaiApiKey]
     * @property {string} [adImaDaiBackupStream]
     * @property {object} [adImaDaiAdTagParameters]
     * @property {string} [adImaDaiStreamActivityMonitorId]
     * @property {string} [adImaDaiAuthToken]
     * @property {boolean} [adOutStream]
     * @property {boolean} [adOutStreamMutedAutoplay]
     * @property {string[]} [omidAllowedVendors]
     * @property {boolean} [adOmidSupport]
     * @property {boolean} [adAjaxWithCredentials]
     * @property {boolean} [adRmpVastEnableVpaid]
     * @property {boolean} [adSupportHlsCreatives]
     * @property {boolean} [adRmpVastEnableSimid]
     * @property {number} [adLoadMediaTimeout]
     * @property {number} [adLoadVastTimeout]
     * @property {number} [adMaxNumRedirects]
     * @property {boolean} [adCountDown]
     * @property {string} [adParser]
     * @property {string} [adPageUrl]
     * @property {string} [relatedLoc]
     * @property {object[]} [relatedData]
     * @property {number} [relatedUpNextOffset]
     * @property {boolean} [relatedUpNextAutoplay]
     * @property {boolean} [relatedEndedLoop]
     * @property {boolean} [relatedAudioOnly]
     * @property {function|null} [relatedCallback]
     * @property {string} [playlistLoc]
     * @property {object[]} [playlistData]
     * @property {boolean} [playlistUpNextAutoplay]
     * @property {boolean} [playlistEndedLoop]
     * @property {boolean} [playlistAudioOnly]
     * @property {function|null} [playlistCallback]
     * @property {boolean} [video360]
     * @property {number} [video360FocalLength]
     * @property {number} [video360MaxFocalLength]
     * @property {number} [video360MinFocalLength]
     * @property {number} [video360InitialLat]
     * @property {number} [video360InitialLon]
     * @property {number} [video360MobileGyroOffset]
     * @property {Src} [video360FallbackSrc]
     * @property {boolean} [loopModule]
     * @property {string} [infoModule]
     * @property {boolean} [theaterModeModule]
     * @property {CustomModule} [customModule]
     * @property {object} [muxDataSettings]
     * @property {boolean} [muxDataUseListData]
     * @property {object} [bitmovinAnalyticsConfig]
     * @property {string} [customAllowDenyListUrl]
     * @param {RadiantMediaPlayerSettings} settings
     * @param {object} [shadowRoot]
     * @return {Promise<>}
     */
    init(settings: {
        licenseKey: string;
        width?: number;
        height?: number;
        iframeMode?: boolean;
        iframeAllowed?: boolean;
        autoHeightMode?: boolean;
        autoHeightModeRatio?: number;
        backgroundColor?: string;
        skin?: string;
        iconsSet?: string;
        iconsSize?: number;
        customIconsLoc?: string;
        iconSpinner?: string;
        fullWindowSkin?: boolean;
        skinBackgroundColor?: string;
        skinButtonColor?: string;
        skinAccentColor?: string;
        hideControls?: boolean;
        hideCentralPlayButton?: boolean;
        hideCentralBuffering?: boolean;
        hideSeekBar?: boolean;
        hideFullscreen?: boolean;
        hideVolume?: boolean;
        hideExternalPlayerLabels?: boolean;
        disableKeyboardControl?: boolean;
        longFormContent?: boolean;
        automaticFullscreenOnLandscape?: boolean;
        automaticLandscapeOnFullScreen?: boolean;
        fullscreenFullWindowMode?: boolean;
        fixedLabelsLanguage?: string;
        doubleClickForFullscreen?: boolean;
        pauseContentWhenViewingAreaIsClicked?: boolean;
        autoplay?: boolean;
        autoplayCount?: number;
        requestAutoplayCapabilitiesData?: boolean;
        detectAutoplayTimeout?: number;
        viewableAutoplay?: boolean;
        viewablePlayPause?: boolean;
        viewableThreshold?: number;
        srcChangeAutoplay?: boolean;
        posterScaleMode?: string;
        autoplayAnimatedPoster?: boolean;
        hideInitialBlackFrameWhenNoPoster?: boolean;
        scaleMode?: string;
        loop?: boolean;
        muted?: boolean;
        permanentMuted?: boolean;
        initialVolume?: number;
        forceInitialVolume?: boolean;
        rememberVolume?: boolean;
        rememberCurrentTime?: boolean;
        rememberQuality?: boolean;
        bitrateDataDisplayed?: string;
        displayCodecData?: boolean;
        preload?: string;
        delayToFade?: number;
        contentMetadata?: {
            title?: string;
            description?: string;
            artist?: string;
            album?: string;
            id?: string;
            releaseDate?: string;
            thumbnail?: string;
            duration?: string;
            googleCastType?: string;
            artwork?: {
                src: string;
                sizes: string;
                type: string;
            }[];
            poster?: string[];
            endOfVideoPoster?: string[];
            animatedPoster?: string;
        };
        appName?: string;
        logo?: string;
        logoLoc?: string;
        logoWatermark?: boolean;
        logoPosition?: string;
        logoMargin?: string;
        pauseContentOnLogoClick?: boolean;
        sharing?: boolean;
        sharingUrl?: string;
        sharingCode?: string;
        sharingNetworks?: string[];
        frameRate?: number;
        strictGdprCompliance?: boolean;
        displayRemainingTimeInPlaceOfDuration?: boolean;
        errorOnlyShowCustomText?: boolean;
        customTrackNames?: {
            captions?: string;
            quality?: string;
            audio?: string;
        };
        flipVideo?: {
            x?: number;
            y?: number;
            z?: number;
        };
        audioOnly?: boolean;
        audioOnlyUseVideoLayout?: boolean;
        audioOnlyIcecast?: boolean;
        audioOnlyID3UI?: boolean;
        debugLevel?: number;
        debugForceRawConsoleLogs?: number;
        pathToRmpFiles?: string;
        offsetStartPosition?: number;
        quickRewind?: number;
        quickForward?: number;
        ajaxWithCredentials?: boolean;
        allowLocalStorage?: boolean;
        pip?: boolean;
        floating?: boolean;
        floatingThreshold?: number;
        retryParameters?: {
            manifest?: {
                timeout?: number;
                maxAttempts?: number;
                delay?: number;
            };
            levels?: {
                timeout?: number;
                maxAttempts?: number;
                delay?: number;
            };
            segment?: {
                timeout?: number;
                maxAttempts?: number;
                delay?: number;
            };
            drm?: {
                timeout?: number;
                maxAttempts?: number;
                delay?: number;
            };
        };
        dashFirst?: boolean;
        shakaRestrictions?: {
            minWidth?: number;
            maxWidth?: number;
            minHeight?: number;
            maxHeight?: number;
            minPixels?: number;
            maxPixels?: number;
            minAudioBandwidth?: number;
            maxAudioBandwidth?: number;
            minVideoBandwidth?: number;
            maxVideoBandwidth?: number;
        };
        shakaDrm?: {
            servers: object;
            clearKeys?: object;
            advanced?: object;
            minHdcpVersion?: string;
        };
        shakaRequestConfiguration?: object;
        shakaCustomConfig?: object;
        shakaFullCustomConfig?: object;
        shakaCustomRequestFilter?: Function | null;
        shakaCustomResponseFilter?: Function | null;
        shakaDrmFairPlayInitDataTransform?: Function | null;
        shakaDrmEmeFairPlay?: boolean;
        shakaKeySystemsByURI?: object;
        shakaOffline?: boolean;
        shakaOfflinePreferredTrackQuality?: number;
        shakaMaxBufferAhead?: number;
        shakaMaxBufferBehind?: number;
        shakaClearBufferSwitch?: boolean;
        shakaLiveSync?: boolean;
        shakaAWSMediaTailor?: boolean;
        shakaAWSMediaTailorAdsParam?: object;
        ignoreHardwareResolution?: boolean;
        disableVideo?: boolean;
        disableAudio?: boolean;
        disableText?: boolean;
        disableIFrames?: boolean;
        disableThumbnails?: boolean;
        hlsJSFetchXhrWithCredentials?: boolean;
        autoBumpCaptionsOnVisibleControlBar?: boolean;
        hlsJSCaptionsTextTrack1Label?: string;
        hlsJSCaptionsTextTrack2Label?: string;
        hlsJSCaptionsTextTrack3Label?: string;
        hlsJSCaptionsTextTrack4Label?: string;
        hlsJSAppleAppStoreCompliance?: boolean;
        hlsJSStopDownloadWhilePaused?: boolean;
        hlsJSCustomConfig?: object;
        hlsJSFullCustomConfig?: object;
        forceNativeHlsOverHlsJS?: boolean;
        interstitialShowAdUI?: boolean;
        forceHlsJSOnAppleDevices?: boolean;
        forceMseHlsOnAppleDevices?: boolean;
        hlsJSProgressive?: boolean;
        hlsJSMaxBufferAhead?: number;
        hlsJSMaxBufferBehind?: number;
        manualSwitchingMode?: string;
        consumeLessEnergy?: boolean;
        hlsEngine?: string;
        capLevelToPlayerSize?: boolean;
        ignoreDevicePixelRatio?: boolean;
        lowLatencyMode?: boolean;
        preferredKeySystems?: string[];
        videoPreference?: {
            label?: string;
            videoCodecs?: string[];
            videoHdr?: string[];
        };
        audioPreference?: {
            lang?: string;
            label?: string;
            audioCodecs?: string[];
            spatialAudio?: boolean;
        };
        subtitlePreference?: {
            lang?: string;
            role?: string;
            textFormats?: string[];
        };
        enableCMCD?: boolean;
        useHeadersForCMCD?: boolean;
        cmcdSessionId?: string;
        cmcdContentId?: string;
        cmcdVersion?: number;
        cmcdIncludeKeys?: string[];
        enableCMSD?: boolean;
        fpsDrm?: {
            certificatePath: string;
            processSpcPath: string;
            licenseResponseType?: string;
            licenseRequestHeaders?: object[];
            certificateRequestHeaders?: object[];
            extractContentId?: Function;
            licenseRequestMessage?: Function;
            licenseRequestLoaded?: Function;
            keySystem?: string;
        };
        src: {
            hls?: string;
            dash?: string;
            mp4?: string[];
            webm?: string[];
            fps?: string;
            m4a?: string;
            mp3?: string;
            ogg?: string;
        };
        initialQuality?: number;
        pdCheckCodecsDone?: boolean;
        labels?: {
            hint?: {
                play?: string;
                pause?: string;
                seek?: string;
                enterFullscreen?: string;
                exitFullscreen?: string;
                quickRewind?: string;
                quickForward?: string;
                sharing?: string;
                sharingLink?: string;
                sharingEmbedCode?: string;
                quality?: string;
                volume?: string;
                mute?: string;
                unmute?: string;
                minus?: string;
                plus?: string;
                speed?: string;
                captions?: string;
                track?: string;
                transcript?: string;
                audio?: string;
                chapters?: string;
                live?: string;
                pip?: string;
                close?: string;
                settings?: string;
                back?: string;
                cast?: string;
                airplay?: string;
                playlist?: string;
                next?: string;
                previous?: string;
                related?: string;
                upNext?: string;
                up?: string;
                down?: string;
                left?: string;
                right?: string;
                default?: string;
                off?: string;
                loop?: string;
                info?: string;
            };
            fccCaptions?: {
                fontColor?: string;
                fontOpacity?: string;
                fontSize?: string;
                fontFamily?: string;
                fontEdge?: string;
                backgroundColor?: string;
                backgroundOpacity?: string;
                windowColor?: string;
                windowOpacity?: string;
            };
            error?: {
                customErrorMessage?: string;
                noSupportMessage?: string;
                noSupportInstallChrome?: string;
            };
            ads?: {
                controlBarCustomMessage?: string;
                skipMessage?: string;
                textForClickUIOnMobile?: string;
            };
        };
        dvrUIThreshold?: number;
        ccFiles?: {
            lng: string;
            name: string;
            uri: string;
            default: boolean;
        }[];
        crossorigin?: string;
        ccFontColor?: string;
        ccFontOpacity?: number;
        ccFontSize?: number;
        ccFontFamily?: string;
        ccFontEdge?: string;
        ccBackgroundColor?: string;
        ccBackgroundOpacity?: number;
        ccWindowColor?: string;
        ccWindowOpacity?: number;
        transcripts?: {
            lng: string;
            name: string;
            uri: string;
        }[];
        enableGAVideoTracking?: boolean;
        gaEventParameters?: object;
        gaEvents?: string[];
        enableMatomoTracking?: boolean;
        dataMatomoTitle?: string;
        seekBarThumbnailsLoc?: string;
        chaptersLoc?: string;
        cuePoints?: {
            time: number;
            text: string;
        }[];
        cuePointsVisibleOnTimeline?: boolean;
        cuePointsCallback?: Function | null;
        speed?: boolean;
        speedRates?: number[];
        googleCast?: boolean;
        googleCastCordova?: boolean;
        googleCastCordovaDebug?: boolean;
        googleCastReceiverAppId?: string;
        googleCastAndroidReceiverCompatible?: boolean;
        googleCastVmapAdsRequest?: string;
        googleCastAdTagUrl?: string;
        googleCastHeaders?: object;
        googleCastDrmToday?: boolean;
        googleCastEnableUITextDisplayer?: boolean;
        googleCastData?: object;
        googleCastDisableAds?: boolean;
        googleCastAllowSenderVolumeManagement?: boolean;
        airplay?: boolean;
        airplayWithMms?: boolean;
        ads?: boolean;
        adTagUrl?: string;
        adShowMarkers?: boolean;
        adOnAdBlockPreventPlayback?: boolean;
        adsResponse?: string;
        adImaTest?: boolean;
        adTagWaterfall?: string[];
        adLocale?: string;
        adUseStyledNonLinearAds?: boolean;
        adSchedule?: {
            preroll?: string;
            midroll?: string[][];
            postroll?: string;
        };
        adScheduleWaterfall?: string[];
        adScheduleCallback?: Function | null;
        adScheduleReloadOnEnded?: boolean;
        adVpaidMode?: string;
        adVpaidControls?: boolean;
        adContentDuration?: number;
        adContentKeywords?: string;
        adContentTitle?: string;
        adForceNonLinearFullSlot?: boolean;
        adTagReloadOnEnded?: boolean;
        adShowRemainingTime?: boolean;
        adAutoAlign?: boolean;
        adEnablePreloading?: boolean;
        adCookiesEnabled?: boolean;
        adLiveStreamPrefetchSeconds?: number;
        adContinuousPlayback?: string;
        adForceNativeFullscreenOnIosForAds?: boolean;
        adNonLinearAdSlotWidth?: number;
        adNonLinearAdSlotHeight?: number;
        adCompanionBackfillMode?: string;
        adPpid?: string;
        adSessionId?: string;
        omidAccessModeRules?: object;
        adImaDai?: boolean;
        adImaDaiVodContentSourceId?: string;
        adImaDaiVodVideoId?: string;
        adImaDaiVodPod?: boolean;
        adImaDaiVodPodRequestStreamURLCallback?: Function | null;
        adImaDaiLiveAssetKey?: string;
        adImaDaiPodNetworkCode?: string;
        adImaDaiCustomAssetKey?: string;
        adImaDaiApiKey?: string;
        adImaDaiBackupStream?: string;
        adImaDaiAdTagParameters?: object;
        adImaDaiStreamActivityMonitorId?: string;
        adImaDaiAuthToken?: string;
        adOutStream?: boolean;
        adOutStreamMutedAutoplay?: boolean;
        omidAllowedVendors?: string[];
        adOmidSupport?: boolean;
        adAjaxWithCredentials?: boolean;
        adRmpVastEnableVpaid?: boolean;
        adSupportHlsCreatives?: boolean;
        adRmpVastEnableSimid?: boolean;
        adLoadMediaTimeout?: number;
        adLoadVastTimeout?: number;
        adMaxNumRedirects?: number;
        adCountDown?: boolean;
        adParser?: string;
        adPageUrl?: string;
        relatedLoc?: string;
        relatedData?: object[];
        relatedUpNextOffset?: number;
        relatedUpNextAutoplay?: boolean;
        relatedEndedLoop?: boolean;
        relatedAudioOnly?: boolean;
        relatedCallback?: Function | null;
        playlistLoc?: string;
        playlistData?: object[];
        playlistUpNextAutoplay?: boolean;
        playlistEndedLoop?: boolean;
        playlistAudioOnly?: boolean;
        playlistCallback?: Function | null;
        video360?: boolean;
        video360FocalLength?: number;
        video360MaxFocalLength?: number;
        video360MinFocalLength?: number;
        video360InitialLat?: number;
        video360InitialLon?: number;
        video360MobileGyroOffset?: number;
        video360FallbackSrc?: {
            hls?: string;
            dash?: string;
            mp4?: string[];
            webm?: string[];
            fps?: string;
            m4a?: string;
            mp3?: string;
            ogg?: string;
        };
        loopModule?: boolean;
        infoModule?: string;
        theaterModeModule?: boolean;
        customModule?: {
            hint: string;
            svg: string;
            svgHover: string;
            callback: Function;
        };
        muxDataSettings?: object;
        muxDataUseListData?: boolean;
        bitmovinAnalyticsConfig?: object;
        customAllowDenyListUrl?: string;
    }, shadowRoot?: object): Promise<any>;
    refTime: number;
    shadowRoot: any;
    initAlreadyCalledForThisInstance: boolean;
    analyticsInterval: number;
    rmpGoogleAnalytics: GoogleAnalytics;
    pathToRmpFiles: any;
    windowOnlineFn: any;
    windowOfflineFn: any;
    okHls: boolean;
    forceHlsJSOnAppleDevices: true;
    adForceNativeFullscreenOnIosForAds: boolean;
    dashFirst: boolean;
    okFps: boolean;
    okWebM: boolean;
    okMp4: boolean;
    okM4a: boolean;
    okMp3: boolean;
    okOgg: boolean;
    doubleClickForFullscreen: boolean;
    skin: string;
    ads: boolean;
    rememberVolume: boolean;
    pip: boolean;
    googleCast: boolean;
    airplay: boolean;
    muted: boolean;
    capLevelToPlayerSize: boolean;
    ignoreDevicePixelRatio: boolean;
    crossorigin: string;
    audioOnly: boolean;
    shakaMaxBufferAhead: number;
    hlsJSMaxBufferAhead: number;
    viewableAutoplay: boolean;
    autoplay: boolean;
    autoplayMode: any;
    /******************************************* API *******************************************/
    /**
     * Getter - the current readiness state of the player (true === player ready - false === player still preparing)
     * @type {() => boolean}
     */
    get ready(): () => boolean;
    /**
     * Getter - the current initialized state of the player (true === player has been initialized e.g. viewer interaction or successful autoplay - false otherwise)
     * @type {() => boolean}
     */
    get playerInitialized(): () => boolean;
    /**
     * Getter - the current environment the player is running in
     * @typedef {object} ScreenDimension
     * @property {number} width
     * @property {number} height
     * @typedef {object} ViewportSize
     * @property {number} width
     * @property {number} height
     * @typedef {object} SmartTVData
     * @property {boolean} tv
     * @property {boolean} webos
     * @property {boolean} tizen
     * @typedef {object} RadiantMediaPlayerEnvironment
     * @property {string} userAgent
     * @property {string} platform
     * @property {string} protocol
     * @property {boolean} primaryPointerIsTouchScreen
     * @property {[boolean, number]} isIos
     * @property {boolean} isIpadOS
     * @property {boolean} isMacOS
     * @property {[boolean, number]} isSafari
     * @property {[boolean, number]} isMacosSafari
     * @property {boolean} isApple
     * @property {[boolean, number]} isAndroid
     * @property {SmartTVData} smartTVData
     * @property {number} devicePixelRatio
     * @property {boolean} isStandalone
     * @property {boolean} isAndroidMobileOrTabletWebView
     * @property {boolean} okMp4
     * @property {boolean} okWebM
     * @property {boolean} okM4a
     * @property {boolean} okMp3
     * @property {boolean} okMse
     * @property {boolean} okMms
     * @property {boolean} okShaka
     * @property {boolean} okHlsJS
     * @property {boolean} okHls
     * @property {boolean} okEme
     * @property {boolean} okFps
     * @property {boolean} ok360
     * @property {boolean} isInIframe
     * @property {boolean} hasIntersectionObserver
     * @property {ViewportSize} viewportSize
     * @property {boolean} hasPassiveEventListeners
     * @property {ScreenDimension} screenDimension
     * @property {boolean} isOnline
     * @property {boolean} hasDownloadSupport
     * @property {boolean} hasNativeFullscreenSupport
     * @property {number} bwEstimate
     * @return {RadiantMediaPlayerEnvironment}
     */
    get environment(): {
        userAgent: string;
        platform: string;
        protocol: string;
        primaryPointerIsTouchScreen: boolean;
        isIos: [boolean, number];
        isIpadOS: boolean;
        isMacOS: boolean;
        isSafari: [boolean, number];
        isMacosSafari: [boolean, number];
        isApple: boolean;
        isAndroid: [boolean, number];
        smartTVData: {
            tv: boolean;
            webos: boolean;
            tizen: boolean;
        };
        devicePixelRatio: number;
        isStandalone: boolean;
        isAndroidMobileOrTabletWebView: boolean;
        okMp4: boolean;
        okWebM: boolean;
        okM4a: boolean;
        okMp3: boolean;
        okMse: boolean;
        okMms: boolean;
        okShaka: boolean;
        okHlsJS: boolean;
        okHls: boolean;
        okEme: boolean;
        okFps: boolean;
        ok360: boolean;
        isInIframe: boolean;
        hasIntersectionObserver: boolean;
        viewportSize: {
            width: number;
            height: number;
        };
        hasPassiveEventListeners: boolean;
        screenDimension: {
            width: number;
            height: number;
        };
        isOnline: boolean;
        hasDownloadSupport: boolean;
        hasNativeFullscreenSupport: boolean;
        bwEstimate: number;
    };
    /**
     * Getter - the player version (semantic versioning - example: 10.1.0)
     * @type {() => string}
     */
    get playerVersion(): () => string;
    /**
     * Getter - the current preload setting used by the player
     * @type {() => string}
     */
    get preloadConfiguration(): () => string;
    /**
     * Getter - the current app name using the player
     * @type {() => string}
     */
    get appNameConfiguration(): () => string;
    /**
     * Getter - the current paused state of the player (true === paused - false === playing)
     * @type {() => boolean}
     */
    get paused(): () => boolean;
    /**
     * Getter - the current stream type for the player (nosupport|dash|hls|mp4|webm|m4a|mp3|ogg|outstream)
     * @type {() => string}
     */
    get streamType(): () => string;
    /**
     * Play content. Returns Promise that resolves if play successful (rejects otherwise)
     * @return {Promise<>}
     */
    play(): Promise<any>;
    pause(): void;
    /**
     * stop content. Returns Promise that resolves if stop successful (rejects otherwise)
     * @return {Promise<>}
     */
    stop(): Promise<any>;
    postStopFn: any;
    fastForward(): void;
    fastRewind(): void;
    /**
     * Returns Promise that resolves to a string ('livedvr'|'voddvr'|'live'|'vod') representing the current stream mode. Note that this method never rejects.
     * @return {Promise<string>}
     */
    getStreamMode(): Promise<string>;
    /**
     * @type {() => object}
     */
    get shakaPlayerInstance(): () => object;
    /**
     * @type {() => object}
     */
    get htmlMediaElement(): () => object;
    /**
     * @type {() => number}
     */
    get bandwidthEstimate(): () => number;
    /**
     * @type {() => number}
     */
    get bufferAhead(): () => number;
    /**
     * @type {() => number}
     */
    get bufferBehind(): () => number;
    /**
     * @type {(loop: boolean) => void}
     */
    set loopConfiguration(loop: () => boolean);
    /******************************************* Loop API *******************************************/
    /**
     * @type {() => boolean}
     */
    get loopConfiguration(): () => boolean;
    loop: boolean;
    /**
     * @type {(inputControls: boolean) => void}
     */
    set controls(inputControls: () => boolean);
    /******************************************* Controls API *******************************************/
    /**
     * @type {() => boolean}
     */
    get controls(): () => boolean;
    /**
     * @type {(input: boolean) => void}
     */
    set controlsVisible(input: () => boolean);
    /**
     * @type {() => boolean}
     */
    get controlsVisible(): () => boolean;
    /**
     * @type {() => number}
     */
    get currentTime(): () => number;
    /**
     * @type {() => number}
     */
    get currentTimeBeforeSeek(): () => number;
    /**
     * seek into content. Returns Promise that resolves if seekTo successful (rejects otherwise).
     * @param {number} msSeek - time in milliseconds to seek into content
     * @return {Promise<>}
     */
    seekTo(msSeek: number): Promise<any>;
    /**
     * @type {() => number}
     */
    get duration(): () => number;
    getFullscreen(): boolean;
    /**
     * enter/exit fullscreen based on input parameter. Returns Promise that resolves if setFullscreen successful (rejects otherwise)
     * @param {boolean} enterFullscreen - the new fullscreen state
     * @return {Promise<>}
     */
    setFullscreen(enterFullscreen: boolean): Promise<any>;
    /******************************************* Live/DVR API *******************************************/
    /**
     * @type {() => number}
     */
    get livePresentationStartTimeAsDate(): () => number;
    /**
     * seek into a DVR stream (recorded part). Returns Promise that resolves if dvrSeekTo successful (rejects otherwise)
     * @param {number} msSeek - time in milliseconds to seek into DVR content
     * @return {Promise<>}
     */
    dvrSeekTo(msSeek: number): Promise<any>;
    /**
     * sync a live or DVR (live part) stream with the current edge of live stream. Returns Promise that resolves if syncToLiveEdge successful (rejects otherwise)
     * @return {Promise<>}
     */
    syncToLiveEdge(): Promise<any>;
    /**
     * Set the current player volume (parameter value between 0 and 1)
     * @type {(inputVolume: number) => void}
     */
    set volume(inputVolume: () => number);
    /**
     * Get the current player volume
     * @type {() => number}
     */
    get volume(): () => number;
    /**
     * Set the current player mute state
     * @type {(muted: boolean) => void}
     */
    set mute(muted: () => boolean);
    /**
     * Get the current player mute state
     * @type {() => boolean}
     */
    get mute(): () => boolean;
    volumeBeforeMute: number | (() => number);
    /**
     * Set the current player playback rate
     * @type {(rate: number) => void}
     */
    set playbackRate(rate: () => number);
    /******************************************* PlaybackRate API *******************************************/
    /**
     * Get the current player playback rate
     * @type {() => number}
     */
    get playbackRate(): () => number;
    showCaptions(lng: string): void;
    hideCaptions(): void;
    /**
     * @type {() => string}
     */
    get ccVisibleLanguage(): () => string;
    /**
     * @type {() => object[]}
     */
    get captionsData(): () => object[];
    /**
     * get|set Array of TextTracks representing the current list of loaded text tracks.
  For captionsList getter: tracks that fail to load will not be listed.
  For captionsList getter: use when alltexttracksloaded API event fires.
     * @type {(ccFiles: TextTrack[]) => void}
     */
    set captionsList(ccFiles: {
        lng: string;
        name: string;
        uri: string;
        default: boolean;
    }[]);
    /**
     * get|set Array of TextTracks representing the current list of loaded text tracks.
  For captionsList getter: tracks that fail to load will not be listed.
  For captionsList getter: use when alltexttracksloaded API event fires.
     * @return {TextTrack[]}
     */
    get captionsList(): {
        lng: string;
        name: string;
        uri: string;
        default: boolean;
    }[];
    ccFiles: {
        lng: string;
        name: string;
        uri: string;
        default: boolean;
    }[];
    hasExternalCCFiles: boolean;
    rmpVttJS: VttJS;
    showPoster(): void;
    hidePoster(): void;
    /**
     * @type {(posters: string[]|string) => void}
     */
    set poster(posters: () => string);
    /**
     * @type {() => string}
     */
    get poster(): () => string;
    posterUri: string;
    resize(): void;
    /**
     * @typedef {object} PlayerSize
     * @property {number} [width]
     * @property {number} [height]
     * @return {PlayerSize}
     */
    getPlayerSize(): {
        width?: number;
        height?: number;
    };
    setPlayerSize(x: string, y: string, fullscreenFullWindowMode: boolean): void;
    width: any;
    height: any;
    /**
     * @typedef {object} Ratio
     * @property {number} player
     * @property {number} media
     * @return {Ratio}
     */
    get ratio(): {
        player: number;
        media: number;
    };
    /**
     * @type {(showWaitingUI: boolean) => void}
     */
    set waitingUI(showWaitingUI: () => boolean);
    /******************************************* Loading UI API *******************************************/
    /**
     * @type {() => boolean}
     */
    get waitingUI(): () => boolean;
    /**
     * @type {(logoObject: {imgUri: string, clickUri: string, position: string, margin: string, watermark: boolean, pauseContentOnLogoClick: boolean}) => void}
     */
    set logoConfiguration(logoObject: {
        imgUri: string;
        clickUri: string;
        position: string;
        margin: string;
        watermark: boolean;
        pauseContentOnLogoClick: boolean;
    });
    /******************************************* Logo API *******************************************/
    /**
     * @return {{imgUri: string, clickUri: string, position: string, margin: string, watermark: boolean, pauseContentOnLogoClick: boolean}}
     */
    get logoConfiguration(): {
        imgUri: string;
        clickUri: string;
        position: string;
        margin: string;
        watermark: boolean;
        pauseContentOnLogoClick: boolean;
    };
    logo: {
        imgUri: string;
        clickUri: string;
        position: string;
        margin: string;
        watermark: boolean;
        pauseContentOnLogoClick: boolean;
    };
    /**
     * @type {(uri: string) => void}
     */
    set thumbnails(uri: () => string);
    /******************************************* Thumbnails API *******************************************/
    /**
     * @type {() => string}
     */
    get thumbnails(): () => string;
    seekBarThumbnailsLoc: string;
    rmpThumbnails: Thumbnails;
    /**
     * @type {(newCameraView: CameraView) => void}
     */
    set cameraView(newCameraView: {
        lat: number;
        lon: number;
        fov: number;
    });
    /******************************************* 360 API *******************************************/
    /**
     * @typedef {object} CameraView
     * @property {number} lat
     * @property {number} lon
     * @property {number} fov
     * @return {CameraView}
     */
    get cameraView(): {
        lat: number;
        lon: number;
        fov: number;
    };
    /******************************************* Chapters API *******************************************/
    /**
     * @typedef {object} Chapter
     * @property {number} start
     * @property {number} end
     * @property {string} title
     * @return {Chapter[]}
     */
    get chaptersData(): {
        start: number;
        end: number;
        title: string;
    }[];
    /**
     * @type {(uri: string) => void}
     */
    set chapters(uri: string);
    /**
     * @return {string}
     */
    get chapters(): string;
    chaptersLoc: string;
    rmpChapters: Chapters;
    /**
     * seek to chapter based on input. Returns Promise that resolves if seekToChapter successful (rejects otherwise)
     * @param {number} chapterIndex - the new chapter to seek to
     * @return {Promise<>}
     */
    seekToChapter(chapterIndex: number): Promise<any>;
    /******************************************* Google Cast API *******************************************/
    /**
     * @type {() => boolean}
     */
    get castMediaLoaded(): () => boolean;
    /**
     * @type {() => boolean}
     */
    get castConnected(): () => boolean;
    /**
     * @type {() => string}
     */
    get castUrl(): () => string;
    /******************************************* metadata API *******************************************/
    /**
     * @typedef {object} Metadata
     * @property {object} data
     * @property {string} type
     * @return {Metadata}
     */
    get metadata(): {
        data: object;
        type: string;
    };
    /******************************************* hls.js API *******************************************/
    /**
     * @typedef {object} ManifestData
     * @property {object[]} levels
     * @property {object[]} audioTracks
     * @property {object[]} subtitles
     * @property {object[]} captions
     * @return {ManifestData}
     */
    get hlsManifestData(): {
        levels: object[];
        audioTracks: object[];
        subtitles: object[];
        captions: object[];
    };
    /**
     * @type {() => object}
     */
    get hlsSessionData(): () => object;
    /**
     * @type {() => object}
     */
    get hlsLevelData(): () => object;
    /**
     * @type {() => object}
     */
    get hlsFragmentData(): () => object;
    /**
     * @type {() => object}
     */
    get hlsFragmentBeingPlayedData(): () => object;
    /**
     * @type {() => object}
     */
    get hlsRawID3KLVSamplesData(): () => object;
    /**
     * @type {() => object}
     */
    get hlsJSInstance(): () => object;
    hlsStartLoad(): void;
    hlsStopLoad(): void;
    /******************************************* Error API *******************************************/
    /**
     * @typedef {object} ErrorData
     * @property {number} code
     * @property {string} message
     * @property {object} event
     * @property {boolean} fatal
     * @return {ErrorData}
     */
    get errorData(): {
        code: number;
        message: string;
        event: object;
        fatal: boolean;
    };
    /**
     * @typedef {object} WarningData
     * @property {number} code
     * @property {string} message
     * @property {object} event
     * @property {boolean} fatal
     * @return {WarningData}
     */
    get warningData(): {
        code: number;
        message: string;
        event: object;
        fatal: boolean;
    };
    getModuleOverlayVisible(type: string): boolean;
    setModuleOverlayVisible(type: string, visible: boolean): void;
    resetAutoplayCount(): void;
    getAutoplayResult(): string;
    onAutoplayResultKnownFn: any;
    /******************************************* Viewable API *******************************************/
    /**
     * @type {() => boolean}
     */
    get playerVisible(): () => boolean;
    /******************************************* Frame API *******************************************/
    /**
     * @type {() => number}
     */
    get currentFramerate(): () => number;
    /**
     * @type {() => number}
     */
    get droppedFramesCount(): () => number;
    /**
     * @type {() => number}
     */
    get currentFrameNumber(): () => number;
    /**
     * @type {() => number}
     */
    get totalFramesNumber(): () => number;
    /**
     * seek to a specific frame based on input. Returns Promise that resolves if seekToFrame successful (rejects otherwise).
     * @param {string} frameLocation - the frame to seek to (example: '10', 'next', 'previous')
     * @return {Promise<>}
     */
    seekToFrame(frameLocation: string): Promise<any>;
    /**
     * @type {(data: SharingData) => void}
     */
    set sharingData(data: {
        url: string;
        code: string;
    });
    /******************************************* Sharing API *******************************************/
    /**
     * @typedef {object} SharingData
     * @property {string} url
     * @property {string} code
     * @return {SharingData}
     */
    get sharingData(): {
        url: string;
        code: string;
    };
    sharingUrl: string;
    sharingCode: string;
    /******************************************* CuePoint API *******************************************/
    /**
     * @type {() => CuePoint}
     */
    get cuePointData(): () => {
        time: number;
        text: string;
    };
    /********************************* Video ads API - Mix IMA | rmp-vast *********************************/
    /**
     * @type {() => string}
     */
    get adParserConfiguration(): () => string;
    /**
     * @type {() => boolean}
     */
    get vpaidCreative(): () => boolean;
    /**
     * @type {() => boolean}
     */
    get adLinear(): () => boolean;
    /**
     * @type {() => boolean}
     */
    get adOnStage(): () => boolean;
    /**
     * @type {() => boolean}
     */
    get linearAdOnStage(): () => boolean;
    /**
     * @type {() => string}
     */
    get adSystem(): () => string;
    /**
     * @type {() => string}
     */
    get adContentType(): () => string;
    /**
     * @type {() => string}
     */
    get adTitle(): () => string;
    /**
     * @type {() => string}
     */
    get adDescription(): () => string;
    /**
     * @type {() => string}
     */
    get adMediaUrl(): () => string;
    /**
     * @type {() => number}
     */
    get adMediaHeight(): () => number;
    /**
     * @type {() => number}
     */
    get adMediaWidth(): () => number;
    /**
     * @type {() => number}
     */
    get adCurrentTime(): () => number;
    /**
     * @type {() => number}
     */
    get adDuration(): () => number;
    /**
     * @type {() => boolean}
     */
    get adPaused(): () => boolean;
    /**
     * @type {() => string}
     */
    get currentAdTagUrl(): () => string;
    /**
     * load a VAST tag at input parameter adTag - pass optional adTagWaterfall parameter for client-side waterfalling. Returns Promise that resolves if loadAds successful (rejects otherwise)
     * @param {string} adTag - URI to VAST tag
     * @param {string[]} [adTagWaterfall] - optional Array of VAST tag URI to be used for client-side waterfalling
     * @param {boolean} [firstPlayAdRequest]
     * @return {Promise<>}
     */
    loadAds(adTag: string, adTagWaterfall?: string[], firstPlayAdRequest?: boolean): Promise<any>;
    adTagUrl: any;
    adTagWaterfall: string[];
    onAdDestroyLoadAdsFn: any;
    /**
     * stop playing current advertisement and free up player resources. Returns Promise that resolves if stopAds successful (rejects otherwise - will also reject if no ad on stage)
     * @return {Promise<>}
     */
    stopAds(): Promise<any>;
    imaAdOnStage: boolean;
    /**
     * skip current advertisement and free up player resources - if the advertisement can be skipped. Returns Promise that resolves if skipAd successful (rejects otherwise - will also reject if ad is not skippable)
     * @return {Promise<>}
     */
    skipAd(): Promise<any>;
    /**
     * @type {(newAdSchedule: AdSchedule) => void}
     */
    set adScheduleConfiguration(newAdSchedule: {
        preroll?: string;
        midroll?: string[][];
        postroll?: string;
    });
    /**
     * @typedef {object} AdSchedule
     * @property {string} [preroll]
     * @property {string[][]} [midroll]
     * @property {string} [postroll]
     * @return {AdSchedule}
     */
    get adScheduleConfiguration(): {
        preroll?: string;
        midroll?: string[][];
        postroll?: string;
    };
    /**
     * @type {() => boolean}
     */
    get adSkippableState(): () => boolean;
    /**
     * @type {() => number}
     */
    get adSkipTimeOffset(): () => number;
    /**
     * @type {(inputAdUI: boolean) => void}
     */
    set adUI(inputAdUI: () => boolean);
    /**
     * @type {() => boolean}
     */
    get adUI(): () => boolean;
    /**
     * getAdPosition, getIsBumper, getMaxDuration, getPodIndex, getTimeOffset, getTotalAds > for Google IMA
     * adPodCurrentIndex, adPodLength > for rmp-vast
     * @typedef {object} AdPodInfo
     * @property {function} [getAdPosition]
     * @property {function} [getIsBumper]
     * @property {function} [getMaxDuration]
     * @property {function} [getPodIndex]
     * @property {function} [getTimeOffset]
     * @property {function} [getTotalAds]
     * @property {number} [adPodCurrentIndex]
     * @property {number} [adPodLength]
     * @return {AdPodInfo}
     */
    get adPodInfo(): {
        getAdPosition?: Function;
        getIsBumper?: Function;
        getMaxDuration?: Function;
        getPodIndex?: Function;
        getTimeOffset?: Function;
        getTotalAds?: Function;
        adPodCurrentIndex?: number;
        adPodLength?: number;
    };
    /**
     * @type {() => object[]}
     */
    get adUniversalAdIds(): () => object[];
    /**
     * @type {() => string}
     */
    get advertiserName(): () => string;
    /**
     * @type {() => string}
     */
    get adSurveyUrl(): () => string;
    /**
     * @param {number} adSlotWidth
     * @param {number} adSlotHeight
     * @param {object} [opt_settings]
     * @return {object[]}
     */
    getCompanionAds(adSlotWidth: number, adSlotHeight: number, opt_settings?: object): object[];
    /**
     * Detect ad-blocker. Returns a Promise that resolves to a Boolean indicating if an ad blocker has been detected on page (true === adblocker detected) or rejects if ads setting is false and this is not a AWS Media Tailor stream
     * @return {Promise<boolean>}
     */
    getAdBlock(): Promise<boolean>;
    /********************************* Video Advertisement Error API *********************************/
    /**
     * @type {() => string}
     */
    get adErrorMessage(): () => string;
    /**
     * @type {() => number}
     */
    get adVastErrorCode(): () => number;
    /**
     * @type {() => string}
     */
    get adErrorType(): () => string;
    /**
     * @type {() => number}
     */
    get adErrorCode(): () => number;
    /********************************* Video ads API - IMA specific *********************************/
    /**
     * @type {() => object}
     */
    get adsManager(): () => object;
    /**
     * @type {() => string}
     */
    get adID(): () => string;
    /**
     * @type {() => string}
     */
    get adCreativeAdId(): () => string;
    /**
     * @type {() => string}
     */
    get adCreativeId(): () => string;
    /**
     * @type {() => string}
     */
    get adDealId(): () => string;
    /**
     * @type {() => string}
     */
    get adApiFramework(): () => string;
    /**
     * @type {() => object}
     */
    get adTraffickingParameters(): () => object;
    /**
     * @type {() => string}
     */
    get adTraffickingParametersString(): () => string;
    /**
     * @type {() => string[]}
     */
    get adWrapperAdIds(): () => string[];
    /**
     * @type {() => string[]}
     */
    get adWrapperAdSystems(): () => string[];
    /**
     * @type {() => string[]}
     */
    get adWrapperCreativeIds(): () => string[];
    getCompanionAd(): object;
    /******************************************* API ANALYTICS *******************************************/
    /**
     * @type {() => number}
     */
    get timeViewed(): () => number;
    /**
     * @type {() => number}
     */
    get percentViewed(): () => number;
    /**
     * @type {() => number}
     */
    get currentTimeInPercent(): () => number;
    /**
     * @type {() => number}
     */
    get timeReady(): () => number;
    /**
     * @type {() => number}
     */
    get startUpTime(): () => number;
    /**
     * @type {(newGAEventParameters: string) => void}
     */
    set gaEventParametersConfiguration(newGAEventParameters: () => object);
    /******************************************* Google Analytics API *******************************************/
    /**
     * @type {() => object}
     */
    get gaEventParametersConfiguration(): () => object;
    gaEventParameters: any;
    /**
     * @type {(config: BitmovinAnalyticsConfig) => void}
     */
    set bitmovinAnalyticsConfiguration(config: {
        key: string;
        videoId: string;
        title: string;
    });
    /***************************************** Bitmovin Analytics API *****************************************/
    /**
     * @typedef {object} BitmovinAnalyticsConfig
     * @property {string} key
     * @property {string} videoId
     * @property {string} title
     * @return {BitmovinAnalyticsConfig}
     */
    get bitmovinAnalyticsConfiguration(): {
        key: string;
        videoId: string;
        title: string;
    };
    bitmovinAnalyticsConfig: {
        key: string;
        videoId: string;
        title: string;
    };
    /**
     * @type {(newFloating: boolean) => void}
     */
    set floatingStatus(newFloating: () => boolean);
    /******************************************* Floating API *******************************************/
    /**
     * @type {() => boolean}
     */
    get floatingStatus(): () => boolean;
    /******************************************* Audio API *******************************************/
    /**
     * returns the list of all audio tracks currently available to the player
     * @typedef {object} AudioTrack
     * @property {boolean} active
     * @property {number} id
     * @property {string} language
     * @return {AudioTrack[]}
     */
    get audioTracks(): {
        active: boolean;
        id: number;
        language: string;
    }[];
    /**
     * sets the player audio track based on id parameter - no op if id is out of bound
     * @type {(id: number) => void}
     */
    set audioTrack(id: () => number);
    /**
     * returns the id of the current audio track
     * @type {() => number}
     */
    get audioTrack(): () => number;
    innerAbrAutoMode: boolean;
    /******************************************* Quality API *******************************************/
    /**
     * Returns the list of available video renditions currently available to the player
     * @typedef {object} Quality
     * @property {boolean} active
     * @property {number} audioCodec
     * @property {number} bitrate
     * @property {number} height
     * @property {number} id
     * @property {string} videoCodec
     * @property {number} width
     * @return {Quality[]}
     */
    get qualities(): {
        active: boolean;
        audioCodec: number;
        bitrate: number;
        height: number;
        id: number;
        videoCodec: string;
        width: number;
    }[];
    /**
     * set the video rendition in the player based on input parameter (video track id from qualities or quality getters)
     * set to -1 for auto ABR
     * @type {(index: number) => void}
     */
    set quality(index: () => number);
    /**
     * returns the id of the current video rendition
     * @type {() => number}
     */
    get quality(): () => number;
    /**
     * Getter for adaptive bitrate streaming mode (true === enabled - false === disabled)
     * @type {() => boolean}
     */
    get abrAutoMode(): () => boolean;
    /******************************************* Destroy API *******************************************/
    /**
     * Method to destroy player instance (free up resources - this does not remove player container from DOM - if you want to remove player container please do so when destroycompleted event fires or destroy resolves). Returns Promise that resolves if successful (rejects otherwise)
     * @return {Promise<>}
     */
    destroy(): Promise<any>;
    rmpApiDestroy: ApiDestroy;
    changingSrc: boolean;
    proceedApiDestroy: boolean;
    /**
     * Update the current set of content metadata available to the player
     * @type {(metadata: ContentMetadata) => void}
     */
    set contentMetadataConfiguration(metadata: () => {
        title?: string;
        description?: string;
        artist?: string;
        album?: string;
        id?: string;
        releaseDate?: string;
        thumbnail?: string;
        duration?: string;
        googleCastType?: string;
        artwork?: {
            src: string;
            sizes: string;
            type: string;
        }[];
        poster?: string[];
        endOfVideoPoster?: string[];
        animatedPoster?: string;
    });
    /******************************************* METADATA API *******************************************/
    /**
     * Read the current set of content metadata available to the player
     * @type {() => ContentMetadata}
     */
    get contentMetadataConfiguration(): () => {
        title?: string;
        description?: string;
        artist?: string;
        album?: string;
        id?: string;
        releaseDate?: string;
        thumbnail?: string;
        duration?: string;
        googleCastType?: string;
        artwork?: {
            src: string;
            sizes: string;
            type: string;
        }[];
        poster?: string[];
        endOfVideoPoster?: string[];
        animatedPoster?: string;
    };
    contentMetadata: any;
    showAirplayPlaybackTargetPicker(): void;
    /******************************************* Offline API *******************************************/
    /**
     * Request the player to query the current list of downloaded content. Returns Promise that resolves to an Array of DownloadedItem object if listDownloadedContent is successful or rejects to a ErrorData object (warning).
     * @typedef {object} DownloadedItem
     * @property {object} appMetadata
     * @property {number} duration
     * @property {number} expiration
     * @property {string} offlineUri
     * @property {string} originalManifestUri
     * @property {number} size
     * @return {Promise<DownloadedItem[]>}
     */
    listDownloadedContent(): Promise<{
        appMetadata: object;
        duration: number;
        expiration: number;
        offlineUri: string;
        originalManifestUri: string;
        size: number;
    }[]>;
    /**
     * Request the player to start downloading content for offline storage. Returns Promise that resolves if download has been successful or rejects to a ErrorData object (warning).
     * @return {Promise<>}
     */
    download(): Promise<any>;
    shakaOfflineStoreOperation: any;
    /**
     * Request the player to abort downloading content for offline storage. Returns Promise that resolves if download has been successfully aborted or rejects to a ErrorData object (warning).
     * @return {Promise<>}
     */
    abortDownload(): Promise<any>;
    /**
     * Getter - must be queried when downloadprogress API event fires and will return a Number between 0 and 1 representing the current progress for the current download. Returns -1 if this value is not available.
     * @type {() => number}
     */
    get downloadProgress(): () => number;
    /**
     * Request the player to load a previously downloaded content. This method takes a DownloadedItem object as an input. A list of DownloadedItem objects can be obtained with listDownloadedContent method. Returns Promise that resolves if loadDownload is successful or rejects to a ErrorData object.
     * @param {DownloadedItem} content - the offline item to load (list of DownloadedItem objects can be obtained with listDownloadedContent method)
     * @return {Promise<>}
     */
    loadDownload(content: {
        appMetadata: object;
        duration: number;
        expiration: number;
        offlineUri: string;
        originalManifestUri: string;
        size: number;
    }): Promise<any>;
    /**
     * Request the player to remove a DownloadedItem from offline storage. This method takes a DownloadedItem object as an input. A list of DownloadedItem objects can be obtained with listDownloadedContent method. Returns Promise that resolves if removeDownload is successful or rejects to a ErrorData object (warning).
     * @param {DownloadedItem} content - the offline item to remove (list of DownloadedItem objects can be obtained with listDownloadedContent method)
     * @return {Promise<>}
     */
    removeDownload(content: {
        appMetadata: object;
        duration: number;
        expiration: number;
        offlineUri: string;
        originalManifestUri: string;
        size: number;
    }): Promise<any>;
    getPlaylistItem(): number;
    /**
     * Load a new playlist item into the player. Returns Promise that resolves if setPlaylistItem is successful or rejects if an error occurs while trying to load new playlist item
     * @param {number} index - the new playlist item to load
     * @return {Promise<>}
     */
    setPlaylistItem(index: number): Promise<any>;
    /**
     * Returns a list of PlaylistItem currently available to the player
     * @typedef {object} PlaylistItem
     * @property {object} src
     * @property {ContentMetadata} contentMetadata
     * @property {string} [adTagUrl]
     * @property {string[]} [adTagWaterfall]
     * @property {string} [seekBarThumbnailsLoc]
     * @property {TextTrack[]} [ccFiles]
     * @property {string} [chaptersLoc]
     * @property {string} [sharingUrl]
     * @property {string} [sharingCode]
     * @property {Logo} [logo]
     * @return {PlaylistItem[]}
     */
    getPlaylistData(): {
        src: object;
        contentMetadata: {
            title?: string;
            description?: string;
            artist?: string;
            album?: string;
            id?: string;
            releaseDate?: string;
            thumbnail?: string;
            duration?: string;
            googleCastType?: string;
            artwork?: {
                src: string;
                sizes: string;
                type: string;
            }[];
            poster?: string[];
            endOfVideoPoster?: string[];
            animatedPoster?: string;
        };
        adTagUrl?: string;
        adTagWaterfall?: string[];
        seekBarThumbnailsLoc?: string;
        ccFiles?: {
            lng: string;
            name: string;
            uri: string;
            default: boolean;
        }[];
        chaptersLoc?: string;
        sharingUrl?: string;
        sharingCode?: string;
        logo?: Logo;
    }[];
    /**
     * Load a new list of PlaylistItem into the player. Returns Promise that resolves if setPlaylistData is successful or rejects to a ErrorData object.
     * @param {PlaylistItem[]} playlistData - the new list of PlaylistItem to load in the player
     * @return {Promise<>}
     */
    setPlaylistData(playlistData: {
        src: object;
        contentMetadata: {
            title?: string;
            description?: string;
            artist?: string;
            album?: string;
            id?: string;
            releaseDate?: string;
            thumbnail?: string;
            duration?: string;
            googleCastType?: string;
            artwork?: {
                src: string;
                sizes: string;
                type: string;
            }[];
            poster?: string[];
            endOfVideoPoster?: string[];
            animatedPoster?: string;
        };
        adTagUrl?: string;
        adTagWaterfall?: string[];
        seekBarThumbnailsLoc?: string;
        ccFiles?: {
            lng: string;
            name: string;
            uri: string;
            default: boolean;
        }[];
        chaptersLoc?: string;
        sharingUrl?: string;
        sharingCode?: string;
        logo?: Logo;
    }[]): Promise<any>;
    getPlaylistLoc(): string;
    /**
     * Load a new list of PlaylistItem into the player. Returns Promise that resolves if setPlaylistLoc is successful or rejects to a ErrorData object.
     * @param {string} playlistLoc - URI to new list of PlaylistItem to load in the player
     * @return {Promise<>}
     */
    setPlaylistLoc(playlistLoc: string): Promise<any>;
    setPlaylistItemCallback(callback: Function): void;
    playlistCallback: Function;
    getRelatedItem(): number;
    /**
     * Load a new related item with parameter index into the player
     * Returns a Promise that:
     * resolves if new item successfully loads in player
     * rejects if an error occurs while trying to load new item
     * @param {number} index
     * @return {Promise<>}
     */
    setRelatedItem(index: number): Promise<any>;
    /**
     * Returns a list of RelatedItem currently available to the player
     * @typedef {object} RelatedItem
     * @property {object} src
     * @property {ContentMetadata} contentMetadata
     * @property {string} [adTagUrl]
     * @property {string[]} [adTagWaterfall]
     * @property {string} [seekBarThumbnailsLoc]
     * @property {TextTrack[]} [ccFiles]
     * @property {string} [chaptersLoc]
     * @property {string} [sharingUrl]
     * @property {string} [sharingCode]
     * @property {Logo} [logo]
     * @return {RelatedItem[]}
     */
    getRelatedData(): {
        src: object;
        contentMetadata: {
            title?: string;
            description?: string;
            artist?: string;
            album?: string;
            id?: string;
            releaseDate?: string;
            thumbnail?: string;
            duration?: string;
            googleCastType?: string;
            artwork?: {
                src: string;
                sizes: string;
                type: string;
            }[];
            poster?: string[];
            endOfVideoPoster?: string[];
            animatedPoster?: string;
        };
        adTagUrl?: string;
        adTagWaterfall?: string[];
        seekBarThumbnailsLoc?: string;
        ccFiles?: {
            lng: string;
            name: string;
            uri: string;
            default: boolean;
        }[];
        chaptersLoc?: string;
        sharingUrl?: string;
        sharingCode?: string;
        logo?: Logo;
    }[];
    /**
     * Load a new list of RelatedItem into the player. This method returns a Promise that resolves if player has successfully updated the list of RelatedItem or rejects to a ErrorData object if not.
     * @param {RelatedItem[]} relatedData
     * @return {Promise<>}
     */
    setRelatedData(relatedData: {
        src: object;
        contentMetadata: {
            title?: string;
            description?: string;
            artist?: string;
            album?: string;
            id?: string;
            releaseDate?: string;
            thumbnail?: string;
            duration?: string;
            googleCastType?: string;
            artwork?: {
                src: string;
                sizes: string;
                type: string;
            }[];
            poster?: string[];
            endOfVideoPoster?: string[];
            animatedPoster?: string;
        };
        adTagUrl?: string;
        adTagWaterfall?: string[];
        seekBarThumbnailsLoc?: string;
        ccFiles?: {
            lng: string;
            name: string;
            uri: string;
            default: boolean;
        }[];
        chaptersLoc?: string;
        sharingUrl?: string;
        sharingCode?: string;
        logo?: Logo;
    }[]): Promise<any>;
    getRelatedLoc(): string;
    /**
     * Load a new list of RelatedItem into the player. This method returns a Promise that resolves if player has successfully updated the list of RelatedItem or rejects to a ErrorData object if not.
     * @param {string} relatedLoc
     * @return {Promise<>}
     */
    setRelatedLoc(relatedLoc: string): Promise<any>;
    setRelatedItemCallback(callback: Function): void;
    relatedCallback: Function;
    rmpApiSrc: ApiSrc;
    /**
     * change player content source based on input
     * return Promise that resolves if successful (rejects otherwise)
     * @param {Src} src
     * @param {number} [pdIndex]
     * @return {Promise<>}
     */
    setSrc(src: {
        hls?: string;
        dash?: string;
        mp4?: string[];
        webm?: string[];
        fps?: string;
        m4a?: string;
        mp3?: string;
        ogg?: string;
    }, pdIndex?: number): Promise<any>;
    getSrc(): string;
    isChangingSrc(): boolean;
    /**
     * @type {(shakaCustomRequestFilter: function) => void}
     */
    set shakaCustomRequestFilterConfiguration(shakaCustomRequestFilter: () => Function);
    /******************************************* Shaka DRM API *******************************************/
    /**
     * @type {() => function}
     */
    get shakaCustomRequestFilterConfiguration(): () => Function;
    shakaCustomRequestFilter: Function;
    /**
     * @type {(shakaRequestConfiguration: object) => void}
     */
    set shakaRequestFilterConfiguration(shakaRequestConfiguration: () => object);
    /**
     * @type {() => object}
     */
    get shakaRequestFilterConfiguration(): () => object;
    shakaRequestConfiguration: any;
    /**
     * @type {(shakaDrm: ShakaDrm) => void}
     */
    set shakaDrmConfiguration(shakaDrm: () => {
        servers: object;
        clearKeys?: object;
        advanced?: object;
        minHdcpVersion?: string;
    });
    /**
     * @type {() => ShakaDrm}
     */
    get shakaDrmConfiguration(): () => {
        servers: object;
        clearKeys?: object;
        advanced?: object;
        minHdcpVersion?: string;
    };
    shakaDrm: {
        servers: object;
        clearKeys?: object;
        advanced?: object;
        minHdcpVersion?: string;
    };
    /******************************************* Novage P2P API *******************************************/
    get shakaP2PEngine(): any;
    #private;
}
declare class Utils {
    static initWindowRmpGlobals(): void;
    static polyfillFullscreenEvents(): void;
    constructor(rmp: any);
    set initialAutoplayRequest(value: boolean);
    get initialAutoplayRequest(): boolean;
    detectSrc(): void;
    fireAutoplayFailure(): void;
    autoplayFailureRestorePlayUI(): void;
    fireAutoplaySuccess(): void;
    playPromise(): void;
    fireLevelSwitchEvents(): void;
    error(code: any, event: any, logOnly: any): void;
    warning(code: any, event: any): void;
    updateDurationText(duration: any, currentTime: any): void;
    refreshHtml5VideoErrorManagement(): void;
    refreshHtml5VideoEndedManagement(): void;
    #private;
}
declare class ReadyManagement {
    constructor(rmp: any);
    get timeReady(): number;
    updateOverlayModuleSelection(): void;
    minimalFire(): void;
    fire(): void;
    init(): void;
    #private;
}
declare class SizeManagement {
    constructor(rmp: any);
    set initialWidth(width: number);
    get initialWidth(): number;
    set initialHeight(height: number);
    get initialHeight(): number;
    destroy(): void;
    resizePlayer(firstResize: any): void;
    initialSizing(): void;
    #private;
}
declare class EventsManagement {
    static checkInView(container: any, element: any): boolean;
    constructor(rmp: any);
    get firstTimeupdate(): boolean;
    get currentTimeBeforeSeek(): number;
    get currentTimeBeforeAd(): number;
    get dvrCurrentTime(): number;
    durationchangeCallback(): void;
    loadedmetadataCallback(): void;
    wireUnstalledBufferEvents(): void;
    unwireUnstalledBufferEvents(): void;
    unstalledCallback(): void;
    waitingCallback(): void;
    endedListCallback(): void;
    endedCallback(): void;
    attachAuxiliaryEvents(): void;
    pauseCallback(): void;
    removeReplayIcon(): void;
    playCallback(): void;
    timeupdateCallback(): void;
    #private;
}
declare class DomManagement {
    constructor(rmp: any);
    prepare(): void;
    append(): void;
    #private;
}
declare class PlaybackManagement {
    constructor(rmp: any);
    get startUpTime(): number;
    get firstPlay(): boolean;
    set playerInitialized(initialized: boolean);
    get playerInitialized(): boolean;
    get adImaDisplayContainerInitialized(): boolean;
    get firstFrameReached(): boolean;
    unwireAdAutoplayEvents(): void;
    init(event: any): void;
    #private;
}
declare class InitManagement {
    constructor(rmp: any);
    get hasTranscripts(): boolean;
    get validatedLanguage(): string;
    set ccFilesNativeTextTracksLoadedCount(index: number);
    get ccFilesNativeTextTracksLoadedCount(): number;
    set originalAdTagUrl(url: string);
    get originalAdTagUrl(): string;
    set originalAdTagWaterfall(arrayUrls: any[]);
    get originalAdTagWaterfall(): any[];
    get originalAdSchedule(): {};
    get imaDaiLive(): boolean;
    get imaDaiVod(): boolean;
    get imaDaiPod(): boolean;
    get imaDaiUseNativeHls(): boolean;
    iosAddTrackElements(): void;
    selectStreamingProtocol(): void;
    postAutoplayDetection(): void;
    wireIosExternalCCFiles(): void;
    unwireIosExternalCCFiles(): void;
    unwireHtml5VideoEvents(): void;
    unwireInitAdEvents(): void;
    createVideoTag(): void;
    #private;
}
declare class UIManagement {
    static appendCSSForCustomIcons(icons: any, adOutStream: any, tvPlayerSkin: any): void;
    static appendCSSForNativeCCRendering(): void;
    constructor(rmp: any);
    hideChrome(): void;
    showChrome(): void;
    showCentralPlay(): void;
    hideCentralPlay(): void;
    showLoadingSpin(): void;
    hideLoadingSpin(): void;
    hideControlsUI(): void;
    showControlsUI(): void;
    restorePlayUI(): void;
    appendContentTitle(): void;
    appendContentDescription(): void;
    prepareLiveUI(): void;
    prepareSkin(): void;
    destroy(): void;
    #private;
}
declare class ModuleManagement {
    constructor(rmp: any);
    get openableTypes(): string[];
    set overlayValidated(updatedArray: any[]);
    get overlayValidated(): any[];
    appendModuleSelection(): void;
    appendHint(type: any, label: any): void;
    destroy(type: any): void;
    open(type: any, immediate: any, event: any): void;
    close(type: any, immediate: any, event: any): void;
    closeAll(): void;
    updatePlayPauseUI(paused: any): void;
    appendToControlBar(type: any): void;
    appendToModuleBar(type: any): void;
    appendOverlay(type: any): void;
    setActiveLevel(type: any, newLevelIndex: any): void;
    #private;
}
declare class LogsManagement {
    static getCheckSum(playerVersion: any): number;
    static hasFormData(): boolean;
    static sendLog(formData: any): Promise<any>;
    constructor(rmp: any);
    destroy(): void;
    init(): void;
    #private;
}
declare class Accessible {
    constructor(rmp: any);
    button(element: any, ariaLabel: any, callClick: any, type: any, keyboardShortcut: any): void;
    destroy(): void;
    init(): void;
    #private;
}
declare class ColorsManagement {
    constructor(rmp: any);
    applySkinColors(): void;
    #private;
}
declare class License {
    static isTrial(decodedKey: any): any[];
    static isLocalTest(testSite: any): boolean;
    constructor(rmp: any);
    get hostname(): any;
    get type(): string;
    destroy(): void;
    terminate(endType: any): void;
    validate(): boolean;
    #private;
}
declare class VolumeManagement {
    constructor(rmp: any);
    updateVolumeIcon(currentVolume: any): void;
    destroy(): void;
    init(): void;
    #private;
}
declare class FullscreenManagement {
    constructor(rmp: any);
    wireIosFullscreen(): void;
    unwireIosFullscreen(): void;
    executeFullscreenRequest(): void;
    destroy(): void;
    init(): void;
    #private;
}
declare class SeekManagement {
    constructor(rmp: any);
    get draggingTimeCursor(): boolean;
    get touchDown(): boolean;
    destroy(): void;
    appendSeekBar(): void;
    executeSeek(time: any): void;
    #private;
}
declare class PosterManagement {
    constructor(rmp: any);
    filterPoster(): void;
    wirePosterLoadEvents(): void;
    unwirePosterLoadEvents(): void;
    initAnimatedPoster(): void;
    init(): void;
    #private;
}
declare class Logo {
    constructor(rmp: any);
    filter(): void;
    hide(): void;
    show(): void;
    init(): void;
    update(): void;
    #private;
}
declare class AdsHelpers {
    static tcfapi(): void;
    static uspapi(): void;
    static rfc3986EncodeURIComponent(str: any): string;
    static getOmidAccessModeRules(inputOmidAccessModeRules: any): {};
    static isGoogleImaDaiAvailable(): boolean;
    constructor(rmp: any);
    setAdVolume(v: any): void;
    setAdMute(muted: any): void;
    replaceAdTagVar(inputAdTag: any): any;
    endedOutStreamUI(): void;
    seekToOffsetStartPosition(): void;
    createControlBarAdInfo(): void;
    setUIForAds(adUI: any): void;
    updateVPAIDStatus(adLinear: any): void;
    udpatePlayPause(): void;
    addCountDown(): void;
    createAdMarkers(arrayMarkers: any, duration: any): void;
    clearAdMarkers(): void;
    appendRemainingTimeBar(): void;
    clearAdRemainingTimeBarInterval(): void;
    destroy(): void;
    #private;
}
declare class GoogleCast {
    constructor(rmp: any);
    get remotePlayerState(): string;
    get remotePlayerController(): any;
    setCastAudioTrack(index: any): void;
    isCastMediaLoaded(): boolean;
    loadCastMedia(newSession: any): void;
    destroy(): void;
    init(): void;
    #private;
}
declare class GoogleCastCordova {
    constructor(rmp: any);
    get castMediaEnded(): boolean;
    loadDebug(): void;
    setCastAudioTrack(): void;
    isCastMediaLoaded(): boolean;
    loadCastMedia(newSession: any): void;
    destroy(resumeLocalPlayer: any): void;
    init(): void;
    #private;
}
declare class Mux {
    constructor(rmp: any);
    get shakaPlayer(): any;
    destroy(): void;
    init(): void;
    initHlsJS(): void;
    initShakaPlayer(): void;
    initHTML5(): void;
    #private;
}
declare class GoogleAnalytics {
    constructor(rmp: any);
    destroy(): void;
    init(): void;
    #private;
}
declare class VttJS {
    constructor(rmp: any, ccFiles: any);
    set ccData(value: any);
    get ccData(): any;
    set ccEnabled(value: boolean);
    get ccEnabled(): boolean;
    parse(caption: any): void;
    destroy(): void;
    init(): void;
    #private;
}
declare class Thumbnails {
    constructor(rmp: any);
    get array(): any[];
    get uris(): any[];
    get urisTimestamps(): any[];
    set currentURI(uri: string);
    get currentURI(): string;
    appendThumbnailsElement(): void;
    destroy(): void;
    init(): void;
    #private;
}
declare class Chapters {
    constructor(rmp: any);
    get array(): any[];
    destroy(): void;
    init(): void;
    #private;
}
declare class ApiDestroy {
    constructor(rmp: any);
    get running(): boolean;
    clear(): void;
    #private;
}
declare class ApiSrc {
    constructor(rmp: any);
    clear(): void;
    init(src: any, pdIndex: any): void;
    #private;
}
