import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { ApiDiscountCode, NewDiscountData } from '@/types';
import { apiService } from '@/utils/ApiService';
import { centsToDollars, formatPrice } from '@/utils/money';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getBackgroundColor,
  getBorderColor,
  getTextColor,
  getPlaceholderTextColor,
  getInputBackgroundColor,
  getIconColor,
} from '@/hooks/useThemeColor';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import CurrencyInput from '@/components/CurrencyInput';
import globalStyles from '@/styles/globalStyles';
import { CardTitle, LabelText } from '@/components/Typography';

interface DiscountFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  jobTotal: number;
  onSubmit: (discountData: NewDiscountData) => Promise<void>;
  isLoading: boolean;
  jobId: number;
}

type DiscountType = 'fixed' | 'percent';

interface DiscountCodeOption {
  label: string;
  value: number;
}

const DiscountFormModal: React.FC<DiscountFormModalProps> = ({
  isVisible,
  onClose,
  jobTotal,
  onSubmit,
  isLoading: parentIsLoading,
  jobId,
}) => {
  const theme = useColorScheme() ?? 'light';

  const [discountType, setDiscountType] = useState<DiscountType>('fixed');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [percentOff, setPercentOff] = useState<string>('0');

  const [selectedDiscountCodeId, setSelectedDiscountCodeId] = useState<
    number | null
  >(null);
  const [availableDiscountCodes, setAvailableDiscountCodes] = useState<
    ApiDiscountCode[]
  >([]);
  const [discountCodeOptions, setDiscountCodeOptions] = useState<
    DiscountCodeOption[]
  >([]);
  const [isFetchingCodes, setIsFetchingCodes] = useState(false);

  const [discountCodeDropdownOpen, setDiscountCodeDropdownOpen] =
    useState(false);
  const [discountTypeDropdownOpen, setDiscountTypeDropdownOpen] =
    useState(false);

  const discountTypeItems = [
    { label: 'Fixed Amount ($)', value: 'fixed' },
    { label: 'Percentage (%)', value: 'percent' },
  ];

  useEffect(() => {
    if (isVisible) {
      setDiscountType('fixed');
      setReason('');
      setAmount(0);
      setPercentOff('0');
      setSelectedDiscountCodeId(null);
      fetchDiscountCodes();
    }
  }, [isVisible]);

  const fetchDiscountCodes = async () => {
    setIsFetchingCodes(true);
    try {
      const codes = await apiService.get<ApiDiscountCode[]>(
        '/discount-codes/active'
      );
      setAvailableDiscountCodes(codes || []);
      setDiscountCodeOptions(
        (codes || []).map((code) => ({
          label: `${code.code} (${code.reason || (code.type === 'fixed' ? `${centsToDollars(code.amount)} off` : `${code.amount}% off`)})`,
          value: code.id,
        }))
      );
    } catch (error) {
      console.log('Failed to fetch discount codes:', error);
      Alert.alert('Error', 'Could not load discount codes.');
      setAvailableDiscountCodes([]);
      setDiscountCodeOptions([]);
    } finally {
      setIsFetchingCodes(false);
    }
  };

  useEffect(() => {
    if (selectedDiscountCodeId) {
      const selectedCode = availableDiscountCodes.find(
        (code) => code.id === selectedDiscountCodeId
      );
      if (selectedCode) {
        setReason(selectedCode.reason || `Discount Code: ${selectedCode.code}`);
        setDiscountType(selectedCode.type);
        if (selectedCode.type === 'fixed') {
          setAmount(selectedCode.amount);
          setPercentOff('0');
        } else {
          setPercentOff(selectedCode.amount.toString());
        }
      }
    } else {
      if (reason.startsWith('Discount Code:')) {
        setReason('');
      }
    }
  }, [selectedDiscountCodeId, availableDiscountCodes, reason]);

  useEffect(() => {
    if (discountType === 'percent') {
      const numericPercent = parseFloat(percentOff);
      if (!isNaN(numericPercent) && jobTotal > 0) {
        setAmount(Math.round(jobTotal * (numericPercent / 100)));
      } else {
        setAmount(0);
      }
    }
  }, [percentOff, discountType, jobTotal]);

  const calculatedDiscountAmount = useMemo(() => {
    if (discountType === 'fixed') return amount;
    const perc = parseFloat(percentOff);
    if (isNaN(perc) || jobTotal === 0) return 0;
    return Math.round(jobTotal * (perc / 100));
  }, [amount, percentOff, discountType, jobTotal]);

  const updatedTotal = useMemo(() => {
    return jobTotal - calculatedDiscountAmount;
  }, [jobTotal, calculatedDiscountAmount]);

  const effectivePercentOff = useMemo(() => {
    if (jobTotal === 0) return 0;
    return (calculatedDiscountAmount / jobTotal) * 100;
  }, [calculatedDiscountAmount, jobTotal]);

  const handleSubmit = () => {
    if (!reason.trim() && !selectedDiscountCodeId) {
      Alert.alert(
        'Validation Error',
        'Please provide a reason for the discount.'
      );
      return;
    }
    if (calculatedDiscountAmount <= 0) {
      Alert.alert(
        'Validation Error',
        'Discount amount must be greater than zero.'
      );
      return;
    }
    if (calculatedDiscountAmount > jobTotal) {
      Alert.alert(
        'Validation Error',
        'Discount amount cannot exceed the job total.'
      );
      return;
    }

    const discountData: NewDiscountData = {
      amount: calculatedDiscountAmount,
      reason: reason.trim(),
      DiscountCodeId: selectedDiscountCodeId,
    };
    onSubmit(discountData);
  };

  const isFormDisabled = !!selectedDiscountCodeId;

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View
          style={[
            styles.modalView,
            { backgroundColor: getBackgroundColor(theme) },
          ]}
        >
          <ScrollView
            style={{ width: '100%' }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={styles.modalHeader}>
              <CardTitle style={{ color: getTextColor(theme) }}>
                Add Discount
              </CardTitle>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={{ color: getIconColor(theme), fontSize: 24 }}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <LabelText style={{ color: getTextColor(theme) }}>
                Discount Code (Optional)
              </LabelText>
              {isFetchingCodes ? (
                <ActivityIndicator color={getTextColor(theme)} />
              ) : (
                <DropDownPicker
                  open={discountCodeDropdownOpen}
                  value={selectedDiscountCodeId}
                  items={discountCodeOptions}
                  setOpen={setDiscountCodeDropdownOpen}
                  setValue={setSelectedDiscountCodeId}
                  setItems={setDiscountCodeOptions}
                  placeholder='Select a discount code'
                  searchable={true}
                  listMode='MODAL'
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: getInputBackgroundColor(theme),
                      borderColor: getBorderColor(theme),
                    },
                  ]}
                  textStyle={{ color: getTextColor(theme) }}
                  placeholderStyle={{ color: getPlaceholderTextColor(theme) }}
                  dropDownContainerStyle={{
                    backgroundColor: getInputBackgroundColor(theme),
                    borderColor: getBorderColor(theme),
                  }}
                  searchTextInputStyle={{
                    borderColor: getBorderColor(theme),
                    color: getTextColor(theme),
                  }}
                  searchPlaceholderTextColor={getPlaceholderTextColor(theme)}
                  theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
                  zIndex={3000}
                  zIndexInverse={1000}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <LabelText style={{ color: getTextColor(theme) }}>
                Reason
              </LabelText>
              <TextInput
                style={[
                  globalStyles.themedFormInput,
                  styles.textInput,
                  {
                    backgroundColor: getInputBackgroundColor(theme),
                    color: getTextColor(theme),
                    borderColor: getBorderColor(theme),
                  },
                ]}
                value={reason}
                onChangeText={setReason}
                placeholder='e.g., Customer Loyalty, Price Match'
                placeholderTextColor={getPlaceholderTextColor(theme)}
                editable={!isFormDisabled}
              />
            </View>

            <View style={styles.formGroup}>
              <LabelText style={{ color: getTextColor(theme) }}>
                Discount Type
              </LabelText>
              <DropDownPicker
                open={discountTypeDropdownOpen}
                value={discountType}
                items={discountTypeItems}
                setOpen={setDiscountTypeDropdownOpen}
                setValue={(valCallback) => {
                  const val =
                    typeof valCallback === 'function'
                      ? valCallback(discountType)
                      : valCallback;
                  if (val) setDiscountType(val as DiscountType);
                }}
                disabled={isFormDisabled}
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: getInputBackgroundColor(theme),
                    borderColor: getBorderColor(theme),
                  },
                ]}
                textStyle={{ color: getTextColor(theme) }}
                dropDownContainerStyle={{
                  backgroundColor: getInputBackgroundColor(theme),
                  borderColor: getBorderColor(theme),
                }}
                theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
                zIndex={2000}
                zIndexInverse={2000}
              />
            </View>

            {discountType === 'fixed' ? (
              <View style={styles.formGroup}>
                <CurrencyInput
                  label='Amount Off ($)'
                  value={amount !== null ? (amount / 100).toFixed(2) : ''}
                  onChangeText={(text: string) => {
                    const cleanedText = text.replace(/[^0-9.]/g, '');
                    const floatValue = parseFloat(cleanedText);
                    if (!isNaN(floatValue)) {
                      setAmount(Math.round(floatValue * 100));
                    } else {
                      setAmount(0);
                    }
                  }}
                  style={[
                    globalStyles.themedFormInput,
                    styles.textInput,
                    {
                      backgroundColor: getInputBackgroundColor(theme),
                      color: getTextColor(theme),
                      borderColor: getBorderColor(theme),
                    },
                  ]}
                  editable={!isFormDisabled}
                />
              </View>
            ) : (
              <View style={styles.formGroup}>
                <LabelText style={{ color: getTextColor(theme) }}>
                  Percent Off (%)
                </LabelText>
                <TextInput
                  style={[
                    globalStyles.themedFormInput,
                    styles.textInput,
                    {
                      backgroundColor: getInputBackgroundColor(theme),
                      color: getTextColor(theme),
                      borderColor: getBorderColor(theme),
                    },
                  ]}
                  value={percentOff}
                  onChangeText={setPercentOff}
                  placeholder='0'
                  keyboardType='numeric'
                  editable={!isFormDisabled}
                />
              </View>
            )}

            <View
              style={[
                styles.summaryBox,
                { borderColor: getBorderColor(theme) },
              ]}
            >
              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryText, { color: getTextColor(theme) }]}
                >
                  Job Total:
                </Text>
                <Text
                  style={[styles.summaryValue, { color: getTextColor(theme) }]}
                >
                  {centsToDollars(jobTotal)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryText, { color: getTextColor(theme) }]}
                >
                  Discount:
                </Text>
                <Text
                  style={[styles.summaryValue, { color: getTextColor(theme) }]}
                >
                  -{centsToDollars(calculatedDiscountAmount)}
                  {calculatedDiscountAmount > 0 && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: getPlaceholderTextColor(theme),
                      }}
                    >
                      {` (${formatPrice(effectivePercentOff)}%)`}
                    </Text>
                  )}
                </Text>
              </View>
              <View
                style={[
                  styles.summaryRow,
                  styles.summaryTotalRow,
                  { borderTopColor: getBorderColor(theme) },
                ]}
              >
                <Text
                  style={[
                    styles.summaryText,
                    styles.summaryTotalText,
                    { color: getTextColor(theme) },
                  ]}
                >
                  New Total:
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    styles.summaryTotalText,
                    { color: getTextColor(theme) },
                  ]}
                >
                  {centsToDollars(updatedTotal)}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <SecondaryButton
                title='Cancel'
                onPress={onClose}
                style={{ flex: 1, marginRight: 8 }}
                disabled={parentIsLoading}
              />
              <PrimaryButton
                title='Add Discount'
                onPress={handleSubmit}
                style={{ flex: 1, marginLeft: 8 }}
                disabled={
                  parentIsLoading ||
                  calculatedDiscountAmount <= 0 ||
                  (!reason.trim() && !selectedDiscountCodeId) ||
                  calculatedDiscountAmount > jobTotal
                }
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  closeButton: {
    padding: 5,
  },
  formGroup: {
    marginBottom: 15,
    zIndex: 1,
  },
  textInput: {},
  dropdown: {},
  summaryBox: {
    marginTop: 15,
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryText: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    marginTop: 5,
    paddingTop: 5,
  },
  summaryTotalText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 10,
  },
});

export default DiscountFormModal;
