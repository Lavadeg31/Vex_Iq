import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { theme, geometricBackgroundStyle } from '../theme';

export const GeometricBackground: React.FC = () => {
  return (
    <View style={geometricBackgroundStyle}>
      <Svg width="100%" height="100%" viewBox="0 0 375 812">
        {/* Large circle in bottom right */}
        <Circle
          cx="350"
          cy="700"
          r="200"
          fill={theme.colors.primary}
          opacity="0.1"
        />
        
        {/* Medium circle in middle left */}
        <Circle
          cx="0"
          cy="400"
          r="150"
          fill={theme.colors.secondary}
          opacity="0.1"
        />

        {/* Triangle shape in top right */}
        <Path
          d="M375 0L375 300L175 0L375 0Z"
          fill={theme.colors.primary}
          opacity="0.1"
        />

        {/* Small decorative circles */}
        <Circle
          cx="50"
          cy="150"
          r="20"
          fill={theme.colors.accent}
          opacity="0.2"
        />
        <Circle
          cx="300"
          cy="450"
          r="15"
          fill={theme.colors.accent}
          opacity="0.2"
        />
      </Svg>
    </View>
  );
}; 