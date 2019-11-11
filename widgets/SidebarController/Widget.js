///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define([
  'dojo/_base/declare',
  'dojo/on',
  'dojo/query',
  'dojo/dom-class',
  'jimu/PoolControllerMixin',
  'jimu/BaseWidget',
], function(declare, on, query, domClass, PoolControllerMixin, BaseWidget) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget, PoolControllerMixin], {
    // DemoWidget code goes here

    //please note that this property is be set by the framework when widget is loaded.
    //templateString: template,

    // baseClass: 'jimu-widget-SidebarController-controller jimu-main-background',
    baseClass: 'jimu-widget-sidebar-controller jimu-main-background',

    postCreate: function() {
      this.inherited(arguments);
      this.allConfigs = this.getAllConfigs();

      for (var i = 0; i < this.allConfigs.length; i++) {
        this._createIconNode(this.allConfigs[i]);
      }
    },

    startup: function() {
      this.inherited(arguments);
    },
    allConfigs: [],
    _createIconNode: function(iconConfig, targetNode) {
      var iconNode, iconImage;
      if (!targetNode) targetNode = this.containerNode;

      iconNode = document.createElement('DIV');
      iconNode.className = 'icon-node';
      if (iconConfig.icon) {
        iconImage = document.createElement('img');
        iconImage.src = iconConfig.icon;
      }
      if (iconConfig.label) {
        iconNode.title = iconConfig.label;
        iconImage.alt = iconConfig.label;
      }

      iconNode.appendChild(iconImage);
      targetNode.appendChild(iconNode);
      // check if the widget is set to open at start

      if (iconConfig.openAtStart) {
        this.activeIconNode = iconNode;
        domClass.add(iconNode, 'jimu-state-active');
        this._showWidgetContent(iconConfig);
      }

      // check if the icon is a group icon
      if (this._isGroupIcon(iconConfig)) {
        // var t = this._isGroupIcon(iconConfig);
        // console.log(t);
        // if group's tooltip has not been created yet
        if (!this.groupTooltips[iconConfig.id]) {
          // create group tooltip and its content
          var groupTooltip = document.createElement('div');
          groupTooltip.className = 'group-tooltip';
          document.body.appendChild(groupTooltip);
          for (var i = 0; i < iconConfig.widgets.length; i++) {
            this._createIconNode(iconConfig.widgets[i], groupTooltip);
          }
          this.groupTooltips[iconConfig.id] = groupTooltip;
        }
      }

      var self = this;
      this.own(
        on(iconNode, 'click', function() {
          query('.jimu-state-active', self.domNode).removeClass(
            'jimu-state-active'
          );

          if (self.activeIconNode === this) {
            self.panelManager.closePanel(iconConfig.id + '_panel');

            self.activeIconNode = null;
            return;
          }

          // clicking on a group icon
          if (self._isGroupIcon(iconConfig)) {
            self.openedWidgetId = null;
            self._positionTooltip(self.groupTooltips[iconConfig.id], this);
            domClass.add(self.groupTooltips[iconConfig.id], 'show');
          } else {
            // clicking on a widget icon
            // show panel
            self._showWidgetContent(iconConfig);
          }

          // if clicked on an active icon node
          if (self.activeIconNode === this) {
            self.activeIconNode = null;
            return;
          }

          domClass.add(this, 'jimu-state-active');
          // self._showWidgetContent(iconConfig);
          self.activeIconNode = this;
        })
      );

      return iconNode;
    },
    _showWidgetContent: function(iconConfig) {
      // console.log(this.openedWidgetId);
      if (this.openedWidgetId) {
        this.panelManager.closePanel(this.openedWidgetId + '_panel');
      }

      var self = this;
      this.panelManager.showPanel(iconConfig).then(
        function(widget) {
          // the panel displays successfully
          self.own(
            on.once(widget, 'close', function() {
              domClass.remove(self.activeIconNode, 'jimu-state-active');
              self.activeIconNode = null;
            })
          );
        },
        function(err) {
          // the panel failed to display
        }
      );

      this.openedWidgetId = iconConfig.id;
    },
    _isGroupIcon: function(iconConfig) {
      return iconConfig.widgets && iconConfig.widgets.length > 1;
    },
    _positionTooltip: function(tooltip, iconNode) {
      var iconBoundingRect = iconNode.getBoundingClientRect();
      tooltip.style.top = iconBoundingRect.top + 'px';
      tooltip.style.left =
        (iconBoundingRect.width || iconNode.clientWidth) + 'px';
    },
    openedWidgetId: '',
    activeIconNode: null,
    groupTooltips: {},
  });
});
