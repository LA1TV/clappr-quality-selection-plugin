import {UICorePlugin, Events, $} from 'clappr'
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
    this._chosenQuality = null
    this._renderedQualities = []
    this._overPlugin = false
    this._qualityChosenCallback = null
    this._hoverTimerId = null
    this._renderPlugin()
  }

  bindEvents() {
    this.listenTo(this.core.mediaControl, Events.MEDIACONTROL_RENDERED, this._onMediaControlRendered)
  }

  // set the callback which will be called when a new quality is chosen,
  // and provided the quality that was chosen as the first argument
  setQualityChosenCallback(handler) {
    this._qualityChosenCallback = handler
  }

  // array of objects which contain a "name" property
  // will appear in the same order
  setQualities(qualities) {
    this._qualities = qualities
    this._renderPlugin()
  }

  // quality should be reference to a quality object passed to setQualities
  setChosenQuality(quality) {
    if (!this._qualityExists(quality)) {
      throw "Quality could not be found."
    }
    this._chosenQuality = quality
    this._renderPlugin()
  }

  // same if same object reference, of if they have id properties which are equal
  _isSameQuality(a, b) {
    if (a === b) {
      return true
    }
    var id1 = a.id;
    var id2 = b.id;
    if (typeof(id1) === "undefined" || typeof(id2) === "undefined") {
      return false
    }
    return id1 === id2
  }

  _qualityExists(quality) {
    return this._qualities.some((a) => {
      return this._isSameQuality(a, quality)
    })
  }

  _onMediaControlRendered() {
    this._appendElToMediaControl()
  }

  _appendElToMediaControl() {
    this.$el.insertAfter(this.core.mediaControl.$el.find(".media-control-layer .media-control-right-panel .drawer-container[data-volume]"))
  }

  _renderPlugin() {
    var $el = $(this.el)
    if (this._qualities.length === 0 || !this._chosenQuality) {
      $el.attr("data-enabled", "0")
    }
    else {
      $el.attr("data-enabled", "1")
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
          var $quality = $("<li />").addClass("quality-row").attr("data-clickable", "1").text(quality.name)
          $quality.click(() => {
            this._overPlugin = false
            this._renderPlugin()
            if (this._qualityChosenCallback) {
              this._qualityChosenCallback(quality)
            }
          })
          this._$qualities.push($quality)
          this._$qualitiesContainer.append($quality)
        })
      }
      for(let i=0; i<this._qualities.length; i++) {
        let quality = this._qualities[i]
        this._$qualities[i][this._isSameQuality(quality, this._chosenQuality) ? "hide" : "show"]()
      }
      this._$chosenQuality.text("Quality: "+this._chosenQuality.name)
      var visible = this._overPlugin || this._hoverTimerId !== null
      this._$qualitiesContainer.attr("data-visible", visible ? "1" : "0")
    }
  }

  _haveQualitiesChanged() {
    if (this._qualities.length !== this._renderedQualities.length) {
      return true
    }
    for(let i=0; i<this._qualities.length; i++) {
      if (!this._isSameQuality(this._qualities[i], this._renderedQualities[i])) {
        return true
      }
    }
    return false
  }

  _onMouseOut() {
    if (this._hoverTimerId !== null) {
      clearTimeout(this._hoverTimerId)
    }
    this._hoverTimerId = setTimeout(() => {
      this._hoverTimerId = null
      this._renderPlugin()
    }, 150)
  }

  render() {
    var $el = $(this.el)
    $el.attr("data-enabled", "0")
    this._$qualitiesContainer = $("<ul />").addClass("qualities-container")
    this._$noQualitiesMsg = $("<li />").addClass("quality-row no-qualities-msg").text("No other qualities available.")
    this._$qualitiesContainer.append(this._$noQualitiesMsg)
    this._$qualities = []
    this._$chosenQuality = $("<div />").addClass("chosen-quality")
    
    var hovering = false
    $el.bind("mouseover", () => {
      if (hovering) {
        return
      }
      hovering = true
      this._overPlugin = true
      this._renderPlugin()
    })

    $el.bind("mouseout", () => {
      if (!hovering) {
        return
      }
      hovering = false
      this._overPlugin = false
      this._onMouseOut()
      this._renderPlugin()
    })

    $el.append(this._$qualitiesContainer)
    $el.append(this._$chosenQuality)
    this._appendElToMediaControl()
    return this
  }

  destroy() {
    if (this._hoverTimerId) {
      clearTimeout(this._hoverTimerId)
      this._hoverTimerId = null
    }
  }
}
