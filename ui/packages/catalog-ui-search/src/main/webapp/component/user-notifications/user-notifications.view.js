/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import React from 'react'
import styled from '../../react-component/styles/styled-components'
import withListenTo from '../../react-component/container/backbone-container'
var Marionette = require('marionette')
var Backbone = require('backbone')
var CustomElements = require('../../js/CustomElements.js')
var NotificationGroupView = require('../notification-group/notification-group.view.js')
var user = require('../singletons/user-instance.js')
var moment = require('moment')
var userNotifications = require('../singletons/user-notifications.js')

const Empty = styled.div`
  transition: transform ${props => props.theme.coreTransitionTime} linear;
  transform: scale(1);
`
const Notifications = styled.div`
  height: 100%;
  width: 100%;
  display: block;
  overflow: auto;
  padding: ${props => props.theme.mediumSpacing};
`
class UserNotifications extends React.Component {
   constructor(props) {
     super(props)
     this.state = mapBackboneToState()
     this.props.listenTo(
       userNotifications, 
       'add remove update', 
       this.updateState
       )
     this.handleEmpty()
   }
   render() { 
     return  userNotifications.isEmpty() ? (
    <Empty>
     <div className="notifications-empty">No Notifications</div>
    </Empty>
    ) : (
     <Notifications>
     <div className="notifications-header" />
     <div className="list-today" />
     <div className="list-previous-one" />
     <div className="list-previous-two" />
     <div className="list-previous-three" />
     <div className="list-previous-four" />
     <div className="list-previous-five" />
     <div className="list-previous-six" />
     <div className="list-older" />
   </Notifications>
   )
   }
   onBeforeShow() {
     this.listToday.show(
       new NotificationGroupView({
         filter: function(model) {
           return moment().diff(model.get('sentAt'), 'days') === 0
         },
         date: 'Today',
       }),
       {
         replaceElement: true,
       }
     )
     this.listPreviousOne.show(
       new NotificationGroupView({
         filter: function(model) {
           return moment().diff(model.get('sentAt'), 'days') === 1
         },
         date: 'Yesterday',
       }),
       {
         replaceElement: true,
       }
     )
     this.listPreviousTwo.show(
       new NotificationGroupView({
         filter: function(model) {
           return moment().diff(model.get('sentAt'), 'days') === 2
         },
         date: moment()
         .subtract(2, 'days')
         .format('dddd'),
       }),
       {
         replaceElement: true,
       }
     )
     this.listPreviousThree.show(
       new NotificationGroupView({
         filter: function(model) {
           return moment().diff(model.get('sentAt'), 'days') === 3
         },
         date: moment()
         .subtract(3, 'days')
         .format('dddd'),
       }),
       {
         replaceElement: true,
       }
     )
     this.listPreviousFour.show(
       new NotificationGroupView({
         filter: function(model) {
           return moment().diff(model.get('sentAt'), 'days') === 4
         },
         date: moment()
         .subtract(4, 'days')
         .format('dddd'),
       }),
       {
         replaceElement: true,
       }
     )
     this.listPreviousFive.show(
       new NotificationGroupView({
         filter: function(model) {
           return moment().diff(model.get('sentAt'), 'days') === 5
         },
         date: moment()
         .subtract(5, 'days')
         .format('dddd'),
       }),
       {
         replaceElement: true,
       }
     )
     this.listPreviousSix.show(
       new NotificationGroupView({
         filter: function(model) {
           return moment().diff(model.get('sentAt'), 'days') === 6
         },
         date: moment()
         .subtract(6, 'days')
         .format('dddd'),
       }),
       {
         replaceElement: true,
       }
     )
     this.listOlder.show(
       new NotificationGroupView({
         filter: function(model) {
           return moment().diff(model.get('sentAt'), 'days') >= 7
         },
         date: 'Older',
       }),
       {
         replaceElement: true,
       }
     )
   }
   onDestroy() {
     userNotifications.setSeen()
     user
       .get('user')
       .get('preferences')
       .savePreferences()
   }
 }
export default withListenTo(UserNotifications)