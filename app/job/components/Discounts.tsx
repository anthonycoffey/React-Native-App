import { Card, Icon, Text } from "@rneui/themed";
import { centsToDollars } from "@/utils/money";
import { View } from "react-native";
import { ListItem } from "@rneui/base";
import React, { useEffect, useState } from "react";
import { Discount, Job } from "types";

type Props = {
  job: Job;
};
export default function Discounts({ job }: Props) {
  const [discountsTotal, setDiscountsTotal] = useState<number>(0);

  useEffect(() => {
    // This function calculates the total of all discounts
    const calculateTotal = () => {
      const total =
        job.Discounts?.reduce((acc, item) => acc + item.amount, 0) ?? 0;
      setDiscountsTotal(total);
    };

    calculateTotal();
  }, [job.Discounts]); // This effect runs whenever job.Discounts changes

  return (
    <Card>
      <Card.Title>Discounts</Card.Title>
      <Text style={{ textAlign: "right" }}>
        Total: {centsToDollars(+discountsTotal)}
      </Text>
      <View>
        {job.Discounts?.map((item: Discount) => (
          <ListItem key={item.id}>
            <Icon name="cash-plus" type="material-community" />
            <ListItem.Content>
              <ListItem.Title>{item.reason}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        ))}
      </View>
    </Card>
  );
}
