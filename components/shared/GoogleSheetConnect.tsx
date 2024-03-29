import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import { useState } from 'react';
import InputWithLabel from './InputWithLabel';
import type { ApiResponse } from 'types';
import toast from 'react-hot-toast';

export default function GoogleSheetConnect() {
  const { t } = useTranslation('common');
  const [sheetId, setSheetId] = useState('');
  const [sheet, setSheet] = useState(null);


  // function connectGoogleSheet
    const connectGoogleSheet = async () => {
        if (!sheetId) {
            toast.error(t('google-sheet-id-required'));
            return;
            }

        const response = await fetch(`/api/google-sheets/${sheetId}`);

        if (!response.ok) {
            const json = (await response.json()) as ApiResponse;
            toast.error(json.error.message);
            return;
            }

        const data = await response.json();
        console.log(data);
    }
    return (
        <>
        <div className="flex flex-row items-end space-x-4">
            <InputWithLabel
                label={t('google-sheet-id')}
                name="source-id"
                aria-label={t('google-sheet-id')}
                className="w-full max-w-md text-sm"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                required
                />
                <Button type="button" variant="outline" className="mb-1" onClick={connectGoogleSheet} size="md">
                    {t('google-sheet-connect')}
                </Button>
            </div>
        </>
    )
}