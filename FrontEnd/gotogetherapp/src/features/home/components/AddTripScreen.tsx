import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import ImagePicker from 'react-native-image-crop-picker';
import { tripApi, createTripPayload } from '../api';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../../constants/color';
import { uploadService } from '../../../services/uploadService';
import { showErrorToast, showSuccessToast } from '../../../utils/appToast';

interface AddTripScreenProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTripScreen: React.FC<AddTripScreenProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalBudget, setTotalBudget] = useState(0);

  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const formatDateForApi = (date: Date) => date.toISOString().split('T')[0]; // "YYYY-MM-DD"

  const handlePickImage = () => {
    ImagePicker.openPicker({
      width: 800,
      height: 600,
      cropping: true,
    })
      .then(image => {
        setImageUri(image.path);
      })
      .catch(() => {});
  };

  const handleClose = () => {
    setName('');
    setStartDate(new Date());
    setEndDate(new Date());
    setTotalBudget(0);
    setImageUri(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showErrorToast('Lỗi', 'Vui lòng nhập địa điểm chuyến đi');
      return;
    }
    if (endDate < startDate) {
      showErrorToast('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setLoading(true);

      // Upload ảnh lên Cloudinary trước nếu có
      let imageUrl: string | undefined = undefined;
      if (imageUri) {
        try {
          imageUrl = await uploadService.uploadTripImage(imageUri);
        } catch (uploadError: any) {
          showErrorToast('Lỗi', uploadError?.message || 'Không thể upload ảnh');
          setLoading(false);
          return;
        }
      }

      // Tạo trip với URL ảnh từ Cloudinary
      const payload: createTripPayload = {
        name: name.trim(),
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate),
        totalBudget: totalBudget > 0 ? totalBudget : undefined,
        ...(imageUrl ? { images: imageUrl } : {}),
      };

      const response = await tripApi.createTrip(payload);
      if (response.status) {
        showSuccessToast('Thành công', 'Đã thêm chuyến đi mới.');
        handleClose();
        onSuccess();
      }
    } catch (error: any) {
      showErrorToast('Lỗi', error?.error || 'Không thể thêm chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        pointerEvents="box-none"
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Thêm chuyến đi</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Destination */}
            <Text style={styles.label}>Địa điểm chuyến đi</Text>
            <TextInput
              style={styles.input}
              placeholder="Vũng tàu"
              placeholderTextColor="#bbb"
              value={name}
              onChangeText={setName}
            />

            {/* Start Date */}
            <Text style={styles.label}>Ngày bắt đầu</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setOpenStartPicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>

            {/* End Date */}
            <Text style={styles.label}>Ngày kết thúc</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setOpenEndPicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Ngân sách dự tính</Text>
            <TextInput
              style={styles.input}
              placeholder="Ngân sách chuyến đi"
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              value={totalBudget ? totalBudget.toString() : ''}
              onChangeText={text => setTotalBudget(Number(text))}
            />

            {/* Image */}
            <Text style={styles.label}>Hình ảnh</Text>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handlePickImage}
            >
              <Text style={styles.imageButtonText}>
                {imageUri ? '✅ Đã chọn ảnh' : 'File image 🖼️'}
              </Text>
            </TouchableOpacity>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Thêm chuyến đi</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      <DatePicker
        modal
        open={openStartPicker}
        date={startDate}
        mode="date"
        title="Ngày bắt đầu"
        confirmText="Xác nhận"
        cancelText="Hủy"
        onConfirm={date => {
          setOpenStartPicker(false);
          setStartDate(date);
        }}
        onCancel={() => setOpenStartPicker(false)}
      />
      <DatePicker
        modal
        open={openEndPicker}
        date={endDate}
        mode="date"
        title="Ngày kết thúc"
        confirmText="Xác nhận"
        cancelText="Hủy"
        minimumDate={startDate}
        onConfirm={date => {
          setOpenEndPicker(false);
          setEndDate(date);
        }}
        onCancel={() => setOpenEndPicker(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  card: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#fafafa',
  },
  dateText: {
    fontSize: 15,
    color: '#333',
  },
  calendarIcon: {
    fontSize: 16,
  },
  imageButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#fafafa',
    alignItems: 'flex-start',
  },
  imageButtonText: {
    fontSize: 15,
    color: '#888',
  },
  submitButton: {
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddTripScreen;
