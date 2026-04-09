import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import ImagePicker from 'react-native-image-crop-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import SimpleFloatingButton from '../../components/SimpleFloatingButton';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../constants/color';
import { celebrateApi, CelebrateItem } from './api';
import { tripApi, Trip } from '../home/api';
import { uploadService } from '../../services/uploadService';
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from '../../utils/appToast';
import { useTranslation } from '../../hooks/useTranslation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function CelebrateScreen() {
  const { t, locale } = useTranslation();
  const [items, setItems] = useState<CelebrateItem[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<CelebrateItem | null>(
    null,
  );
  const [editingCelebrateId, setEditingCelebrateId] = useState<string | null>(
    null,
  );
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [celebrationSearchText, setCelebrationSearchText] = useState('');
  const [tripSearchText, setTripSearchText] = useState('');
  const [celebrateDate, setCelebrateDate] = useState('');
  const [description, setDescription] = useState('');
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [selectedImageUris, setSelectedImageUris] = useState<string[]>([]);

  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchCelebrations = async () => {
    try {
      setErrorText('');
      const [celebrateData, tripData] = await Promise.all([
        celebrateApi.getCelebrations(),
        tripApi.getTrips({ page: 1, limit: 50 }),
      ]);

      setItems(celebrateData);
      setTrips(tripData.data.trips);

      setSelectedTripId(prev => {
        if (prev || tripData.data.trips.length === 0) {
          return prev;
        }
        return tripData.data.trips[0].id;
      });

      setCelebrateDate(prev => (prev ? prev : getTodayString()));
    } catch (error: any) {
      setErrorText(error?.error || error?.message || t('celebrate.loading'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCelebrations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCelebrations();
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) {
      return '--/--/----';
    }
    return new Date(isoDate).toLocaleDateString(
      locale === 'en' ? 'en-US' : 'vi-VN',
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{t('celebrate.emptyTitle')}</Text>
      <Text style={styles.emptyDesc}>{t('celebrate.emptyDesc')}</Text>
    </View>
  );

  const filteredItems = useMemo(() => {
    const keyword = celebrationSearchText.trim().toLowerCase();
    if (!keyword) {
      return items;
    }

    return items.filter(item =>
      (item.trip?.name || '').toLowerCase().includes(keyword),
    );
  }, [items, celebrationSearchText]);

  const renderSearchEmpty = () => (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{t('celebrate.searchEmptyTitle')}</Text>
      <Text style={styles.emptyDesc}>{t('celebrate.searchEmptyDesc')}</Text>
    </View>
  );

  const getItemImages = (item: CelebrateItem) => {
    const imageUrls = item.images?.map(x => x.imageUrl).filter(Boolean) || [];
    if (imageUrls.length > 0) {
      return imageUrls;
    }
    if (item.trip?.images) {
      return [item.trip.images];
    }
    return [];
  };

  const renderGallery = (item: CelebrateItem) => {
    const gallery = getItemImages(item);

    if (!gallery.length) {
      return (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Text style={styles.coverPlaceholderText}>
            {t('celebrate.noImage')}
          </Text>
        </View>
      );
    }

    if (gallery.length === 1) {
      return <Image source={{ uri: gallery[0] }} style={styles.cover} />;
    }

    return (
      <View style={styles.galleryWrap}>
        <Image source={{ uri: gallery[0] }} style={styles.galleryMain} />
        <View style={styles.gallerySide}>
          <Image source={{ uri: gallery[1] }} style={styles.gallerySub} />
          <View style={styles.lastSubWrap}>
            <Image
              source={{ uri: gallery[2] || gallery[1] }}
              style={styles.gallerySub}
            />
            {gallery.length > 3 && (
              <View style={styles.overlayMore}>
                <Text style={styles.overlayMoreText}>
                  +{gallery.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: CelebrateItem }) => {
    const gallery = getItemImages(item);

    return (
      <Pressable style={styles.card} onPress={() => setSelectedDetail(item)}>
        {renderGallery(item)}

        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <View style={styles.datePill}>
              <View style={styles.inlineInfoRow}>
                <FontAwesome6
                  name="calendar-day"
                  size={11}
                  color="#166534"
                  iconStyle="solid"
                />
                <Text style={styles.datePillText}>{formatDate(item.date)}</Text>
              </View>
            </View>
            {!!gallery.length && (
              <View style={styles.inlineInfoRow}>
                <FontAwesome6
                  name="images"
                  size={11}
                  color="#0A7B45"
                  iconStyle="solid"
                />
                <Text style={styles.photoCountText}>{gallery.length} ảnh</Text>
              </View>
            )}
          </View>

          <Text style={styles.tripName} numberOfLines={1}>
            {item.trip?.name || t('celebrate.noTrip')}
          </Text>

          <Text style={styles.description} numberOfLines={3}>
            {item.description || t('celebrate.noDescription')}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.authorRow}>
              {item.user?.avatar ? (
                <Image
                  source={{ uri: item.user.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarPlaceholderText}>
                    {(item.user?.fullName || 'U').slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              )}

              <Text style={styles.authorName} numberOfLines={1}>
                {item.user?.fullName || t('common.user')}
              </Text>
            </View>

            <View style={styles.inlineInfoRow}>
              <FontAwesome6
                name="route"
                size={11}
                color="#64748B"
                iconStyle="solid"
              />
              <Text style={styles.rangeText}>
                {formatDate(item.trip?.startDate)} -{' '}
                {formatDate(item.trip?.endDate)}
              </Text>
            </View>
          </View>

          <View style={styles.inlineInfoRow}>
            <FontAwesome6
              name="circle-info"
              size={12}
              color="#1E6D48"
              iconStyle="solid"
            />
            <Text style={styles.readMoreText}>{t('celebrate.readMore')}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const handleCreatePress = () => {
    if (!trips.length) {
      showInfoToast(t('common.warning'), t('celebrate.noTripsForCreate'));
      return;
    }

    setEditingCelebrateId(null);
    setTripSearchText('');
    setExistingImageUrls([]);
    setDescription('');
    setSelectedImageUris([]);
    setCelebrateDate(getTodayString());
    setSelectedTripId(trips[0]?.id || '');
    setShowCreateModal(true);
  };

  const handleEditPress = () => {
    if (!selectedDetail) {
      return;
    }

    setEditingCelebrateId(selectedDetail.id);
    setTripSearchText('');
    setSelectedTripId(selectedDetail.tripId);
    setCelebrateDate(selectedDetail.date?.slice(0, 10) || getTodayString());
    setDescription(selectedDetail.description || '');
    setExistingImageUrls(getItemImages(selectedDetail));
    setSelectedImageUris([]);
    setSelectedDetail(null);
    setShowCreateModal(true);
  };

  const handlePickImages = async () => {
    try {
      const results = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      const normalized = Array.isArray(results) ? results : [results];
      const uris = normalized
        .map((image: any) => image?.path)
        .filter(Boolean)
        .slice(0, 5);

      setSelectedImageUris(uris);
    } catch {
      // User canceled image picker
    }
  };

  const handleSubmitCreate = async () => {
    if (!selectedTripId) {
      showInfoToast(t('common.warning'), t('celebrate.selectTripRequired'));
      return;
    }

    if (!description.trim()) {
      showInfoToast(t('common.warning'), t('celebrate.descriptionRequired'));
      return;
    }

    if (!celebrateDate.trim()) {
      showInfoToast(t('common.warning'), t('celebrate.dateRequired'));
      return;
    }

    try {
      setCreateLoading(true);

      const uploadedImageUrls = await Promise.all(
        selectedImageUris.map(uri => uploadService.uploadPhoto(uri)),
      );

      if (editingCelebrateId) {
        await celebrateApi.updateCelebrate(editingCelebrateId, {
          date: celebrateDate,
          description: description.trim(),
          images: [...existingImageUrls, ...uploadedImageUrls],
        });
      } else {
        await celebrateApi.createCelebrate({
          tripId: selectedTripId,
          date: celebrateDate,
          description: description.trim(),
          images: uploadedImageUrls,
        });
      }

      setShowCreateModal(false);
      setEditingCelebrateId(null);
      setTripSearchText('');
      setExistingImageUrls([]);
      setDescription('');
      setSelectedImageUris([]);
      await fetchCelebrations();
      showSuccessToast(
        t('common.success'),
        editingCelebrateId
          ? t('celebrate.updatedSuccess')
          : t('celebrate.createdSuccess'),
      );
    } catch (error: any) {
      showErrorToast(
        t('common.error'),
        error?.error || error?.message || t('celebrate.addFailed'),
      );
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <View style={styles.headerSide} />
        <Text style={styles.headerTitle}>{t('celebrate.title')}</Text>
        <View style={styles.headerSide} />
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={celebrationSearchText}
          onChangeText={setCelebrationSearchText}
          placeholder={t('celebrate.searchPlaceholder')}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      <Text style={styles.headerSubtitle}>{t('celebrate.subtitle')}</Text>

      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => item.id || String(index)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading
            ? celebrationSearchText.trim()
              ? renderSearchEmpty
              : renderEmpty
            : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
          />
        }
        ListHeaderComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
              <Text style={styles.loadingText}>{t('celebrate.loading')}</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          errorText ? <Text style={styles.errorText}>{errorText}</Text> : null
        }
      />

      <TouchableOpacity style={styles.actionButton} onPress={handleCreatePress}>
        <Text style={styles.actionButtonText}>{t('celebrate.addNew')}</Text>
      </TouchableOpacity>

      <SimpleFloatingButton
        onPress={handleCreatePress}
        icon="+"
        backgroundColor={SECONDARY_COLOR}
        bottom={24}
        right={20}
        size={56}
      />

      <Modal
        visible={!!selectedDetail}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedDetail(null)}
      >
        <View style={styles.detailOverlay}>
          <Pressable
            style={styles.detailBackdrop}
            onPress={() => setSelectedDetail(null)}
          />

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle} numberOfLines={1}>
                {selectedDetail?.trip?.name ||
                  t('celebrate.detailTripFallback')}
              </Text>
              <View style={styles.detailHeaderActions}>
                <TouchableOpacity
                  onPress={handleEditPress}
                  style={styles.detailEdit}
                >
                  <Text style={styles.detailEditText}>{t('common.edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedDetail(null)}
                  style={styles.detailClose}
                >
                  <Text style={styles.detailCloseText}>
                    {t('common.close')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.detailImageList}
              >
                {selectedDetail && getItemImages(selectedDetail).length > 0 ? (
                  getItemImages(selectedDetail).map((uri, idx) => (
                    <Image
                      key={`${uri}-${idx}`}
                      source={{ uri }}
                      style={styles.detailImage}
                    />
                  ))
                ) : (
                  <View style={[styles.detailImage, styles.coverPlaceholder]}>
                    <Text style={styles.coverPlaceholderText}>
                      {t('celebrate.noImage')}
                    </Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.detailContent}>
                <View style={styles.detailMetaRow}>
                  <FontAwesome6
                    name="calendar-day"
                    size={12}
                    color="#64748B"
                    iconStyle="solid"
                  />
                  <Text style={styles.detailMeta}>
                    {formatDate(selectedDetail?.date)}
                  </Text>
                </View>

                <Text style={styles.detailSectionTitle}>
                  {t('celebrate.content')}
                </Text>
                <Text style={styles.detailDescription}>
                  {selectedDetail?.description || t('celebrate.noDescription')}
                </Text>

                <Text style={styles.detailSectionTitle}>
                  {t('celebrate.tripInfo')}
                </Text>
                <View style={styles.detailInfoRow}>
                  <FontAwesome6
                    name="route"
                    size={12}
                    color="#475569"
                    iconStyle="solid"
                  />
                  <Text style={styles.detailInfoText}>
                    {formatDate(selectedDetail?.trip?.startDate)} -{' '}
                    {formatDate(selectedDetail?.trip?.endDate)}
                  </Text>
                </View>
                <View style={styles.detailInfoRow}>
                  <FontAwesome6
                    name="user"
                    size={12}
                    color="#475569"
                    iconStyle="solid"
                  />
                  <Text style={styles.detailInfoText}>
                    {t('celebrate.creator')}:{' '}
                    {selectedDetail?.user?.fullName || t('common.user')}
                  </Text>
                </View>
                <View style={styles.detailInfoRow}>
                  <FontAwesome6
                    name="images"
                    size={12}
                    color="#475569"
                    iconStyle="solid"
                  />
                  <Text style={styles.detailInfoText}>
                    {t('celebrate.photoCount')}{' '}
                    {selectedDetail ? getItemImages(selectedDetail).length : 0}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowCreateModal(false)}
          />

          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingCelebrateId
                ? t('celebrate.editTitle')
                : t('celebrate.addTitle')}
            </Text>

            {!editingCelebrateId && (
              <>
                <Text style={styles.inputLabel}>
                  {t('celebrate.selectTrip')}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tripList}
                >
                  {trips
                    .filter(trip =>
                      trip.name
                        .toLowerCase()
                        .includes(tripSearchText.trim().toLowerCase()),
                    )
                    .map(trip => {
                      const active = trip.id === selectedTripId;
                      return (
                        <Pressable
                          key={trip.id}
                          onPress={() => setSelectedTripId(trip.id)}
                          style={[
                            styles.tripChip,
                            active && styles.tripChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.tripChipText,
                              active && styles.tripChipTextActive,
                            ]}
                          >
                            {trip.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                </ScrollView>
              </>
            )}

            <Text style={styles.inputLabel}>{t('celebrate.dateLabel')}</Text>
            <TextInput
              value={celebrateDate}
              onChangeText={setCelebrateDate}
              placeholder={t('celebrate.datePlaceholder')}
              style={styles.input}
            />

            <Text style={styles.inputLabel}>
              {t('celebrate.descriptionLabel')}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('celebrate.descriptionPlaceholder')}
              multiline
              style={[styles.input, styles.textArea]}
            />

            <Text style={styles.inputLabel}>{t('celebrate.imagesLabel')}</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={handlePickImages}
              disabled={createLoading}
            >
              <Text style={styles.imagePickerButtonText}>
                {selectedImageUris.length
                  ? t('celebrate.selectedImages', {
                      count: String(selectedImageUris.length),
                    })
                  : t('celebrate.chooseImages')}
              </Text>
            </TouchableOpacity>

            {!!selectedImageUris.length && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.previewList}
              >
                {selectedImageUris.map(uri => (
                  <Image
                    key={uri}
                    source={{ uri }}
                    style={styles.previewImage}
                  />
                ))}
              </ScrollView>
            )}

            {!!existingImageUrls.length && (
              <>
                <Text style={styles.inputLabel}>
                  {t('celebrate.currentImages')}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.previewList}
                >
                  {existingImageUrls.map(uri => (
                    <Image
                      key={uri}
                      source={{ uri }}
                      style={styles.previewImage}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
                disabled={createLoading}
              >
                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitCreate}
                disabled={createLoading}
              >
                {createLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitText}>{t('celebrate.save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E8F0EA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
  },
  headerSide: {
    flex: 1,
  },
  headerTitle: {
    flex: 2,
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    fontSize: 13,
    color: '#557164',
    marginBottom: 6,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 4,
  },
  searchInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CDE2D3',
    backgroundColor: '#F7FCF8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0F172A',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 130,
    gap: 12,
  },
  loadingWrap: {
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D5E4D8',
    overflow: 'hidden',
    shadowColor: '#102515',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cover: {
    width: '100%',
    height: 170,
    backgroundColor: '#E2E8F0',
  },
  galleryWrap: {
    flexDirection: 'row',
    height: 170,
  },
  galleryMain: {
    flex: 2,
    height: 170,
  },
  gallerySide: {
    flex: 1,
    gap: 2,
  },
  gallerySub: {
    flex: 1,
    width: '100%',
  },
  lastSubWrap: {
    flex: 1,
    position: 'relative',
  },
  overlayMore: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayMoreText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    color: '#64748B',
    fontSize: 13,
  },
  cardContent: {
    padding: 12,
    gap: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#C8F2D6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  datePillText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
  },
  inlineInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tripName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  description: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  avatarPlaceholder: {
    backgroundColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  authorName: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  rangeText: {
    color: '#64748B',
    fontSize: 12,
  },
  photoCountText: {
    color: '#0A7B45',
    fontSize: 12,
    fontWeight: '600',
  },
  readMoreText: {
    color: '#1E6D48',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E9EE',
    padding: 16,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyDesc: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    position: 'absolute',
    left: 16,
    right: 88,
    bottom: 28,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#D9F1DE',
    borderWidth: 1,
    borderColor: '#CFEFDB',
  },
  actionButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
  errorText: {
    marginTop: 8,
    color: '#DC2626',
    fontSize: 13,
  },
  detailOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  detailBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    maxHeight: '84%',
    overflow: 'hidden',
  },
  detailHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDEE',
  },
  detailHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailEdit: {
    backgroundColor: '#DDF7E5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  detailEditText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  detailTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    paddingRight: 10,
  },
  detailClose: {
    backgroundColor: '#EEF3F6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  detailCloseText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  detailImageList: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
  },
  detailImage: {
    width: SCREEN_WIDTH - 48,
    height: 240,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  detailContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 8,
  },
  detailMeta: {
    color: '#64748B',
    fontSize: 12,
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailSectionTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  detailDescription: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  detailInfoText: {
    color: '#475569',
    fontSize: 13,
  },
  detailInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    gap: 8,
    maxHeight: '78%',
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  inputLabel: {
    marginTop: 4,
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  tripList: {
    gap: 8,
    paddingVertical: 4,
  },
  tripChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D9E2EC',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tripChipActive: {
    backgroundColor: '#DDF7E5',
    borderColor: '#9EE7B6',
  },
  tripChipText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  tripChipTextActive: {
    color: '#166534',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9E2EC',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9E2EC',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  imagePickerButtonText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  previewList: {
    gap: 8,
    paddingTop: 6,
    paddingBottom: 2,
  },
  previewImage: {
    width: 74,
    height: 74,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  modalActions: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5DEE8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: SECONDARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default CelebrateScreen;
