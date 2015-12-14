import {UICorePlugin, Events} from 'clappr'
import $ from 'jQuery'
import './style.sass'

export default class QualitySelectionPlugin extends UICorePlugin {
  get name() { return 'quality-selection-plugin' }

  get attributes() {
    return {
      'class': this.name
    }
  }

  constructor(core) {
    super(core)
    this._qualities = []
    var chosen = {text:"360p"};
    this._qualities = [
      {text:"720p"},
      chosen,
      {text:"240p"},
    ];
    this._chosenQuality = null
    this._chosenQuality = chosen
    this._renderedQualities = []
    this._overChosenQuality = false
    this._overList = false
    this._renderPlugin()
  }

  bindEvents() {
    this.listenTo(this.core.mediaControl, Events.MEDIACONTROL_RENDERED, this._onMediaControlRendered)
    this.listenTo(this.core.mediaControl, Events.MEDIACONTROL_CONTAINERCHANGED, this._onMediaControlContainerChanged)
  }

  _bindContainerEvents() {
    if (this._oldContainer) {
      this.stopListening(this._oldContainer, Events.CONTAINER_TIMEUPDATE, this._onTimeUpdate)
      this.stopListening(this._oldContainer, Events.CONTAINER_MEDIACONTROL_SHOW, this._onMediaControlShow)
    }
    this._oldContainer = this.core.mediaControl.container
    this.listenTo(this.core.mediaControl.container, Events.CONTAINER_TIMEUPDATE, this._onTimeUpdate)
    this.listenTo(this.core.mediaControl.container, Events.CONTAINER_MEDIACONTROL_SHOW, this._onMediaControlShow)
  }

  _getOptions() {
    if (!("qualitySelectionPlugin" in this.core.options)) {
      throw "'qualitySelectionPlugin' property missing from options object."
    }
    return this.core.options.qualitySelectionPlugin
  }

  // array of {name}
  // will appear in the same order
  setQualities(qualities) {
    // TODO
    this._renderPlugin()
  }

  // quality should be reference to a quality object passed to setQualities
  setChosenQuality(quality) {
    // TODO
    this._renderPlugin()
  }

  _onMediaControlRendered() {
    this._appendElToMediaControl()
  }

  _onMediaControlContainerChanged() {
    this._bindContainerEvents()
  }

  _appendElToMediaControl() {
    this.$el.insertAfter(this.core.mediaControl.$el.find(".media-control-layer .media-control-right-panel .drawer-container[data-volume]"))
  }

  _renderPlugin() {
    var $el = $(this.el)
    if (this._qualities.length === 0) {
      $el.hide()
    }
    else {
      $el.show()
      if (this._haveQualitiesChanged()) {
        this._$qualities.forEach(($a) => {
          $a.remove();
        })
        this._$qualities = []
        if (this._qualities.length <= 1) {
          this._$noQualitiesMsg.show()
        }
        else {
          this._$noQualitiesMsg.hide()
        }
        this._qualities.forEach((quality) => {
          var $quality = $("<li />").addClass("quality-row").attr("data-clickable", "1").text(quality.text)
          $quality.click(() => {
            this._overList = false
            this._renderPlugin()
          })
          this._$qualities.push($quality)
          this._$qualitiesContainer.append($quality)
        })
      }
      for(let i=0; i<this._qualities.length; i++) {
        let quality = this._qualities[i]
        this._$qualities[i][quality === this._chosenQuality ? "hide" : "show"]()
      }
      this._$chosenQuality.text("Quality: "+this._chosenQuality.text)
      var visible = this._overChosenQuality || this._overList
      this._$qualitiesContainer.attr("data-visible", visible ? "1" : "0")
    }
  }

  _haveQualitiesChanged() {
    if (this._qualities.length !== this._renderedQualities.length) {
      return true
    }
    for(let i=0; i<this._qualities.length; i++) {
      if (this._qualities[i] !== this._renderedQualities[i]) {
        return true
      }
    }
    return false
  }

  render() {
    var $el = $(this.el)
    $el.hide()
    this._$qualitiesContainer = $("<ul />").addClass("qualities-container")
    this._$noQualitiesMsg = $("<li />").addClass("quality-row no-qualities-msg").text("No other qualities available.")
    this._$qualitiesContainer.append(this._$noQualitiesMsg)
    this._$qualities = []
    this._$chosenQuality = $("<div />").addClass("chosen-quality")
    this._$chosenQuality.hover(() => {
      this._overChosenQuality = true
      this._renderPlugin()
    }, () => {
      this._overChosenQuality = false
      this._renderPlugin()
    })
    $el.hover(() => {
      this._overList = true
      this._renderPlugin()
    }, () => {
      this._overList = false
      this._renderPlugin()
    })
    $el.append(this._$qualitiesContainer)
    $el.append(this._$chosenQuality)
    this._appendElToMediaControl()
    return this
  }

  destroy() {
    // TODO
  }
}
