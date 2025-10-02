import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";

import FarmerDashboard from "./index";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Farmer">
        <Stack.Screen name="Farmer" component={FarmerDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
