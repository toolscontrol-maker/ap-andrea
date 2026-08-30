import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\\\Users\\\\angel chisvert\\\\Desktop\\\\ANDREA APP';
const mobileRoot = path.join(projectRoot, 'apps', 'mobile');

// 1. Create RotatingAffectionText.tsx
const rotatingComponentPath = path.join(mobileRoot, 'src', 'components', 'ui', 'RotatingAffectionText.tsx');
const rotatingComponentContent = `import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';

const AFFECTION_WORDS = [
  'Andrea',
  'my love',
  'my wife',
  'my darling',
  'the best woman',
];

export function RotatingAffectionText() {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Animate out (fade and move up)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -5,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 2. Change word
        setIndex((prev) => (prev + 1) % AFFECTION_WORDS.length);
        translateYAnim.setValue(5);

        // 3. Animate in (fade and spring to position)
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.spring(translateYAnim, {
            toValue: 0,
            friction: 6,
            tension: 90,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.Text
      style={[
        styles.wordText,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      {AFFECTION_WORDS[index]}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  wordText: {
    color: '#EF826A',
    fontWeight: '800',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
  },
});
`;

fs.writeFileSync(rotatingComponentPath, rotatingComponentContent, 'utf8');
console.log('✅ Created RotatingAffectionText.tsx');

// 2. Update account/index.tsx
const accountIndexPath = path.join(mobileRoot, 'app', '(tabs)', 'account', 'index.tsx');
let accountContent = fs.readFileSync(accountIndexPath, 'utf8');

// Add import if not present
if (!accountContent.includes('RotatingAffectionText')) {
  accountContent = accountContent.replace(
    "import { ConnectedCoupleHeart } from '../../../src/components/ui/ConnectedCoupleHeart';",
    "import { ConnectedCoupleHeart } from '../../../src/components/ui/ConnectedCoupleHeart';\nimport { RotatingAffectionText } from '../../../src/components/ui/RotatingAffectionText';"
  );
}

// Replace footer info card
const oldFooterRegex = /{\/\* APP INFO & VERSION FOOTER \*\/}[\s\S]*?<\/View>\s*<View style={{ height: Spacing\['2xl'\] }}/;
const newFooter = `{\/* APP INFO & VERSION FOOTER *\/}
        <View style={styles.footerInfoCard}>
          <Text style={styles.footerBrandName}>ANDREA APP</Text>
          <View style={styles.footerAffectionRow}>
            <Text style={styles.footerDedicationText}>Made with love for </Text>
            <RotatingAffectionText />
          </View>
        </View>

        <View style={{ height: Spacing['2xl'] }}`;

accountContent = accountContent.replace(oldFooterRegex, newFooter);

// Update footer styles
accountContent = accountContent.replace(
  /footerDedication: \{[\s\S]*?\},/,
  `footerAffectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  footerDedicationText: {
    fontSize: 13,
    color: '#7D7571',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },`
);

fs.writeFileSync(accountIndexPath, accountContent, 'utf8');
console.log('✅ Updated account/index.tsx with RotatingAffectionText and custom love footer');

// 3. Remove Andrea Premium from DevSwitcherBar.tsx
const devSwitcherPath = path.join(mobileRoot, 'src', 'components', 'DevSwitcherBar.tsx');
let devSwitcherContent = fs.readFileSync(devSwitcherPath, 'utf8');

devSwitcherContent = devSwitcherContent.replace(
  /{\/\* Premium Toggle \*\/}[\s\S]*?<\/View>\s*<\/View>/,
  ''
);

fs.writeFileSync(devSwitcherPath, devSwitcherContent, 'utf8');
console.log('✅ Removed Premium toggle from DevSwitcherBar.tsx');
