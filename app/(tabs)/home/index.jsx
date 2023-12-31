import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    ViewBase,
  } from "react-native";
  import React, { useState, useEffect } from "react";
  import { AntDesign, Feather } from "@expo/vector-icons";
export default function index () {
  return (
    <>
      <View
        style={{
          marginHorizontal: 10,
          marginVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12
        }}
      >
        <Pressable
          style={{
            backgroundColor: '#7CB9E8',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>All</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: '#7CB9E8',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Work</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: '#7CB9E8',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 'auto'
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Personal</Text>
        </Pressable>
        <Pressable >
          <AntDesign name='pluscircle' size={30} color='#007FFF' />
        </Pressable>
      </View>
    </>
  )
}

