import React from 'react';
import { StyleSheet, TouchableHighlight, Text, TextInput, View, Image, StatusBar, Button } from 'react-native';
import { TabNavigator } from 'react-navigation';
import { NavigationButton } from '../NavigationButton';

import Camera from "react-native-camera";

import NativeModules from 'NativeModules';
import ReactNativeI18n from 'react-native-i18n';

import { apikey, serverAddress } from '../../apikey';

import { styles } from '../Styles';

export class MainScreen extends React.Component {
  static navigationOptions = {
    title: "Main Screen"
  }

  constructor() {
    super();
    this.state = {
      image: null,
      initialPosition: null,
      lang: null,
      newPhotos: null,
      backCamera: true
    }
  }

  componentDidMount() {
      var lang = ReactNativeI18n.locale;
      this.setState({lang});

      navigator.geolocation.getCurrentPosition( (position) => { 
       var initialPosition = position; 
       this.setState({initialPosition});
       console.log("Got location!");

      }, (error) => alert(JSON.stringify(error)));
  }


  render() {
    console.log(this.state);

    var imageOn = null;

    if (this.state.image != null) {
      imageOn = <View style={{width: 50, height: 50, position: 'absolute', left: 10, top: 10}}>
        <Button onPress={this.clearImage.bind(this)} title="X" />
      </View>
    }

    return (
      <View style={styles.container} collapsable={false}>
        <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={StyleSheet.absoluteFill}
          aspect={Camera.constants.Aspect.fill}
          captureTarget={Camera.constants.CaptureTarget.disk}
          captureQuality={"720p"}
          orientation={"portrait"}
          type={this.state.backCamera ? "back" : "front"}
          >
        </Camera>

        <Image source={{uri: this.state.image}} style={StyleSheet.absoluteFill} />

        {imageOn}
        
        <View style={{position: 'absolute', bottom: 50, left: 0, right: 0}}>
          { this.state.image != null && <Button onPress={this.sendImage.bind(this)} title="Send" /> }
        </View> 

        { this.state.image == null && <TouchableHighlight onPress={this.takePicture.bind(this)} underlayColor={null} style={{ zIndex: 2, alignItems: 'center', position: 'absolute', bottom: 50, left: 0, right: 0}}>
          <View style={{height: 50, width: 50, borderRadius: 128, backgroundColor: '#232528', opacity:0.7}}>
            <View style={{left: 2, top: 2, height: 46, width: 46, borderRadius: 128, backgroundColor: 'white', opacity: 0.7}}>
              
            </View>
          </View>
        </TouchableHighlight> }

        <View style={{position: 'absolute', height: 50, width: 50, right: 10, top: 10}}>
        <Button onPress={() => { this.setState({backCamera: !this.state.backCamera})}} title="#" />
        </View>

        <TextInput
        style={{color: 'white', bottom: 120, left:0, right:0, position: 'absolute', height: 40, backgroundColor: '#232528', opacity: 0.7}}
        onChangeText={(text) => this.setState({text})}
        value={this.state.text}
      />

        {/*<NavigationButton navigation={this.props.navigation} styleType={"SettingsButton"} name={"⚙"} link={"Settings"} />*/}
        
        <StatusBar hidden={false} />

        { this.state.image == null && <NavigationButton navigation={this.props.navigation} styleType={"ViewQueueButton"} name={"View Queue"} link={"Queue"} /> }
      </View>
    );
  }

  sendImage() {
    var url = serverAddress + "/api/upload";

    console.log("Starting sendImage function.");

    var photo = {
        uri: this.state.image,
        type: 'image/jpeg',
        name: 'img.jpg',
    };

    var body = new FormData();
    body.append('apikey', apikey);
    body.append('img', photo);
    body.append('lat', this.state.initialPosition.coords.latitude);
    body.append('lon', this.state.initialPosition.coords.longitude);
    body.append('caption', "");
    body.append('language', this.state.lang);

    xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    xhr.onreadystatechange = function() {      
      if(xhr.readyState == 4 && xhr.status == 200) {
          this.setState({image: null});
      }
    }.bind(this);

    xhr.send(body);
  }

  clearImage() {
    this.setState({image:null});
  }

  takePicture() {
    this.camera.capture()
      .then((data) => { 
        this.setState({image:data.path});
      })
    }
}