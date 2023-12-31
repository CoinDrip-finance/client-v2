import { useAuth, useTransaction as useErdTransaction } from '@elrond-giants/erd-react-hooks';
import { IPoolingOptions } from '@elrond-giants/erd-react-hooks/dist/types';
import { ITransactionOnNetwork } from '@multiversx/sdk-core';
import { Address, Transaction } from '@multiversx/sdk-core/out';

import { TransactionNotificationStatus, useTransactionNotifications } from './useTransactionNotifications';

type TxStatus = "success" | "pending" | "invalid" | "failed";

export interface ITransactionResult {
  hash: string;
  status: TxStatus;
  transaction: ITransactionOnNetwork | null;
}

export const useTransaction = () => {
  const { makeTransaction: makeErdTransaction, whenCompleted } = useErdTransaction();
  const { address, nonce } = useAuth();
  const { pushSignTransactionNotification, removeNotification, pushTxNotification } = useTransactionNotifications();

  const makeTransaction = async (
    transaction: Transaction,
    awaitCompletion: boolean = true,
    poolingOptions?: IPoolingOptions
  ): Promise<ITransactionResult> => {
    let notificationId: string;
    const onBeforeSign = () => {
      notificationId = pushSignTransactionNotification({
        title: "Sign Transaction",
        body: "Check your device to sign the transaction.",
      });
    };
    const onSigned = () => {
      removeNotification(notificationId);
    };

    transaction.setSender(new Address(address!));
    transaction.setNonce(nonce);

    const txHash = await makeErdTransaction({ transaction, onBeforeSign, onSigned });
    if (!awaitCompletion) {
      return {
        hash: txHash,
        status: "pending",
        transaction: null,
      };
    }

    pushTxNotification(txHash, "new");
    const txResult = await whenCompleted(txHash, poolingOptions);
    const txStatus = computeStatus(txResult);
    pushTxNotification(txHash, txStatus);

    return {
      hash: txResult.hash,
      status: txStatus as TxStatus,
      transaction: txResult,
    };
  };

  const computeStatus = (txResult: ITransactionOnNetwork): TransactionNotificationStatus => {
    // @ts-ignore
    if (txResult.status.isSuccessful()) {
      return "success";
    }
    if (txResult.status.isInvalid()) {
      return "invalid";
    }
    if (txResult.status.isFailed()) {
      return "failed";
    }

    return "pending";
  };

  return { makeTransaction, whenCompleted };
};
