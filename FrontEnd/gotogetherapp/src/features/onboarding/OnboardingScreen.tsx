import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_NAME } from '../../constants/screenName';
import Body from '../../components/Layout/Body';
import Button from '../../components/Button/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { getOnboardingData } from './data';

const { width } = Dimensions.get('window');

const OnboardingScreen = () => {
  const { t, locale } = useTranslation();
  const [index, setIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  const onboardingData = getOnboardingData(locale);
  const totalSlides = onboardingData.length;
  const currentSlide = onboardingData[index];

  const handleNext = () => {
    if (!totalSlides) {
      navigation.navigate(SCREEN_NAME.LOGIN as never);
      return;
    }

    if (index < totalSlides - 1) {
      flatListRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      navigation.navigate(SCREEN_NAME.LOGIN as never);
    }
  };

  const dotWidth = onboardingData.map((_, i) => {
    const animated = useRef(new Animated.Value(i === index ? 16 : 8)).current;
    useEffect(() => {
      Animated.timing(animated, {
        toValue: i === index ? 16 : 8,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }, [index]);
    return animated;
  });

  return (
    <Body hideHeader>
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={event => {
            const newIndex = Math.round(
              event.nativeEvent.contentOffset.x / width,
            );
            setIndex(newIndex);
          }}
          renderItem={({ item, index: itemIndex }) => (
            <View style={styles.page}>
              <View style={styles.imageContainer}>
                {itemIndex === 3 && item.image2 && (
                  <Image style={styles.image2} source={item.image2} />
                )}

                {itemIndex === 0 && item.image2 ? (
                  <View style={styles.doubleImageContainer}>
                    <Image style={styles.imageTop} source={item.image} />
                    <View
                      style={{
                        padding: 5,
                        backgroundColor: '#fff',
                        marginTop: 10,
                      }}
                    >
                      <Image style={styles.imageBottom} source={item.image2} />
                    </View>
                  </View>
                ) : (
                  <Image style={styles.image} source={item.image} />
                )}
              </View>
              <View style={styles.dots}>
                {onboardingData.map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[styles.dot, { width: dotWidth[i] }]}
                  />
                ))}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          )}
        />
        <Button
          title={currentSlide?.button || 'Continue'}
          onPress={handleNext}
        />

        <View style={styles.footerContainer}>
          {index === 0 && (
            <>
              <Text>{t('auth.alreadyHaveAccount')} </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(SCREEN_NAME.LOGIN as never)}
              >
                <Text style={styles.loginRedirectText}>
                  {currentSlide?.LoginRedirectText || t('auth.login')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Body>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footerContainer: {
    paddingBottom: 30,
    minHeight: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  page: {
    width,
    alignItems: 'center',
    paddingTop: 60,
  },
  imageContainer: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingTop: 20,
    paddingBottom: 20,
    width: width * 0.9,
    height: width * 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    // width: 370,
    // height: 370,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: '70%',
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    maxWidth: '70%',
    opacity: 0.7,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  image2: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  doubleImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageTop: {
    // width: 370,
    // height: 370,
    resizeMode: 'cover',
  },
  imageBottom: {
    resizeMode: 'cover',
    borderRadius: 15,
    position: 'absolute',
    bottom: 0,
    right: 30,
  },
  loginRedirectText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#00D632',
    fontWeight: '600',
  },
});

export default OnboardingScreen;
