import { Html, Button, Text, Heading, Section } from '@react-email/components';

interface VerifyEmailProps {
  verificationLink: string;
}

export default function VerifyEmail({ verificationLink }: VerifyEmailProps) {
  return (
    <Html>
      <Section style={{ padding: '24px', backgroundColor: '#f9f9f9' }}>
        <Heading style={{ color: '#333' }}>Dinletiyo Hesabınızı Doğrulayın</Heading>
        <Text style={{ color: '#555', fontSize: '16px' }}>
          Merhaba,
        </Text>
        <Text style={{ color: '#555', fontSize: '16px' }}>
          Dinletiyo'ya kayıt olduğunuz için teşekkürler! Hesabınızı doğrulamak ve platformu kullanmaya başlamak için lütfen aşağıdaki butona tıklayın:
        </Text>
        <Button
          href={verificationLink}
          style={{
            backgroundColor: '#e00707',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '5px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'inline-block',
          }}
        >
          E-postamı Doğrula
        </Button>
        <Text style={{ color: '#777', fontSize: '14px', marginTop: '24px' }}>
          Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
        </Text>
      </Section>
    </Html>
  );
}
